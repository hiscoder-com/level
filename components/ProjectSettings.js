import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

import CommitsList from './CommitsList'

import { useCurrentUser } from 'lib/UserContext'
import { countOfChaptersAndVerses, parseManifests } from 'utils/helper'
import { useProject, useMethod } from 'utils/hooks'
import { supabase } from 'utils/supabaseClient'

function ProjectSettings() {
  const { user } = useCurrentUser()
  const [methods] = useMethod(user?.access_token)
  const [resourcesUrl, setResourcesUrl] = useState()
  const [currentMethod, setCurrentMethod] = useState()
  const [isErrorCommit, setIsErrorCommit] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const {
    query: { code },
  } = useRouter()
  const [project] = useProject({ token: user?.access_token, code })
  useEffect(() => {
    if (project?.method && methods) {
      const method = methods.find((method) => method.title === project.method)
      setCurrentMethod(method)
    }
  }, [project?.method, methods])

  useEffect(() => {
    if (project?.resources) {
      const resources = {}
      for (const [key, value] of Object.entries(project?.resources)) {
        resources[
          key
        ] = `https://git.door43.org/${value.owner}/${value.repo}/src/commit/${value.commit}`
      }
      setResourcesUrl(resources)
    }
  }, [project?.resources])

  const handleSaveCommits = async (resources) => {
    setIsErrorCommit(false)
    setIsSaving(true)
    try {
      const { baseResource, newResources } = await parseManifests({
        resources,
        current_method: currentMethod,
      })

      const { data: baseResourceDb } = await supabase
        .from('projects')
        .select('base_manifest')
        .eq('id', project.id)
        .single()

      const isEqualBaseResource =
        JSON.stringify(baseResourceDb.base_manifest) ===
        JSON.stringify({ resource: baseResource.name, books: baseResource.books })

      if (newResources && project && baseResource) {
        const { error } = await supabase
          .from('projects')
          .update({
            resources: newResources,
            base_manifest: {
              resource: baseResource.name,
              books: baseResource.books,
            },
          })
          .eq('id', project.id)
        if (error) throw error
      }

      // if (isEqualBaseResource) {
      //   return
      // }
    } catch (error) {
      setIsErrorCommit(true)

      return
    } finally {
      setIsSaving(false)
    }

    const { data: books, count } = await supabase
      .from('books')
      .select('*', { count: 'exact' })
      .eq('project_id', project?.id)
    if (!count) {
      return
    }

    books.forEach(async (book) => {
      const bookFromGit = project.base_manifest.books.find((el) => el.name === book.code)
      const jsonfromGit = await countOfChaptersAndVerses({
        link: bookFromGit.link,
      })
      if (JSON.stringify(book.chapters) === JSON.stringify(jsonfromGit)) {
        return
      }
      for (const key in jsonfromGit) {
        if (Object.hasOwnProperty.call(jsonfromGit, key)) {
          if (book.chapters[key]) {
            if ((jsonfromGit[key] = book.chapters[key])) {
              const { data: dataLog, error: ErrorLog } = await supabase
                .from('logs')
                .insert({
                  text: `Project #${project.id} - in ${book.code} chapter ${key} have more verses - ${jsonfromGit[key]} than before - ${book.chapters[key]} `,
                })
              const { data: chapter, error } = await supabase
                .from('chapters')
                .select('id,started_at')
                .eq('project_id', project.id)
                .eq('book_id', book.id)
                .eq('num', key)
                .single()
              if (chapter?.started_at) {
                const { data: dataLog, error: ErrorLog } = await supabase
                  .from('logs')
                  .insert({
                    text: `Project #${project.id} - in ${
                      book.code
                    } chapter ${key} already started and script added new verses from ${
                      book.chapters[key] + 1
                    } to ${jsonfromGit[key]}`,
                  })
                for (
                  let index = book.chapters[key] + 1;
                  index <= jsonfromGit[key];
                  index++
                ) {
                  const { data: dataLog, error: ErrorLog } = await supabase
                    .from('verses')
                    .insert({
                      chapter_id: chapter.id,
                      num: index,
                      project_id: project.id,
                      // что вставлять в step?
                    })
                }
              }
            }
          } else {
            const { data: dataLog, error: ErrorLog } = await supabase
              .from('logs')
              .insert({
                text: `Project #${project.id} - in ${book.code} new chapter ${key}`,
              })
            const { data, error } = await supabase.from('chapters').insert([
              {
                num: key,
                verses: jsonfromGit[key],
                book_id: book.id,
                project_id: project.id,
              },
            ])
          }
        }
      }
    })

    //проверка books
  } //TODO проверить - совпадает ли то что вводим и то что было, если да, тогда либо кнопку сохранить неактивной, либо предупреждение, что изменений не было
  return (
    <div className="mx-auto max-w-7xl">
      <div className="h3 mb-3">
        <Link href={'/projects/' + code + '/edit'}>
          <a className="underline text-blue-700">« {project?.title}/edit</a>
        </Link>
      </div>
      <h1 className="h1 mb-3">Настройки проекта</h1>
      <h1 className="h2 mb-3">List of commits</h1>
      <CommitsList
        resourcesUrl={resourcesUrl}
        setResourcesUrl={setResourcesUrl}
        methodId={currentMethod?.id}
      />
      {isErrorCommit && <div className="mt-3">Одна из ссылок на коммит некоректна</div>}

      <button
        className="btn-cyan mt-3"
        onClick={() => {
          handleSaveCommits(resourcesUrl)
        }}
        disabled={isSaving}
      >
        {isSaving ? (
          <svg
            className="animate-spin my-0 mx-auto h-5 w-5 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          'сохранить'
        )}
      </button>
    </div>
  )
}

export default ProjectSettings
