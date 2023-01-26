import { countOfChaptersAndVerses, parseManifests } from 'utils/helper'
import { supabase } from 'utils/supabaseClient'
import { supabaseService } from 'utils/supabaseServer'

export default async function updateCommitsHandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)

  let data = {}
  const {
    method,
    body: { resources, current_method, project_id },
  } = req

  const sendLog = async (log) => {
    const { data, error } = await supabaseService.from('logs').insert({
      log,
    })
    return { data, error }
  }

  switch (method) {
    case 'POST':
      const updateProject = async (newResources, project_id, baseResource) => {
        if (newResources && project_id && baseResource) {
          const { data, error } = await supabase.rpc('update_resources_in_projects', {
            resources: newResources,
            base_manifest: {
              resource: baseResource.name,
              books: baseResource.books,
            },
            project_id: project_id,
          })
          return { data, error }
        }
      }

      try {
        const { baseResource, newResources } = await parseManifests({
          resources,
          current_method,
        })

        const { data: baseResourceDb, error: base_manifest_error } = await supabase
          .from('projects')
          .select('base_manifest')
          .eq('id', project_id)
          .single()

        if (base_manifest_error) throw base_manifest_error

        if (
          JSON.stringify(baseResourceDb.base_manifest) ===
          JSON.stringify({ resource: baseResource.name, books: baseResource.books })
        ) {
          await updateProject(newResources, project_id, baseResource)
          return res.status(200).json({ sucess: true })
        }

        const { data: books } = await supabase
          .from('books')
          .select('id,code,chapters')
          .eq('project_id', project_id)
        if (!books || books?.length === 0) {
          await updateProject(newResources, project_id, baseResource)
          return res.status(200).json({ sucess: true })
        }
        for (const book of books) {
          const bookFromGit = baseResource.books.find((el) => el.name === book.code)

          const jsonFromGit = await countOfChaptersAndVerses({
            link: bookFromGit.link,
          })
          if (JSON.stringify(book.chapters) === JSON.stringify(jsonFromGit)) {
            continue
          }
          for (const key in jsonFromGit) {
            if (Object.hasOwnProperty.call(jsonFromGit, key)) {
              if (!book.chapters[key]) {
                await sendLog(
                  `Project #${project_id} - in ${book.code} new chapter ${key}`
                )
                const { error: insertVersesError } = await supabase.rpc(
                  'insert_additional_chapter',
                  {
                    book_id: book.id,
                    num: key,
                    verses: jsonFromGit[key],
                    project_id,
                  }
                )
                if (insertVersesError) throw insertVersesError
                continue
              }
              if (jsonFromGit[key] > book.chapters[key]) {
                await sendLog(
                  `Project #${project_id} - in ${book.code} chapter ${key} have more verses - ${jsonFromGit[key]} than before - ${book.chapters[key]}`
                )

                const { data: chapter, error: chapterError } = await supabase.rpc(
                  'update_verses_in_chapters',
                  {
                    book_id: book.id,
                    verses: jsonFromGit[key],
                    num: key,
                    project_id,
                  }
                )
                if (chapterError) throw chapterError

                if (chapter?.started_at) {
                  await sendLog(
                    `Project #${project_id} - in ${
                      book.code
                    } chapter ${key} already started and script added new verses from ${
                      book.chapters[key] + 1
                    } to ${jsonFromGit[key]}`
                  )

                  const { error: insertVersesError } = await supabase.rpc(
                    'insert_additional_verses',
                    {
                      start_verse: book.chapters[key] + 1,
                      finish_verse: jsonFromGit[key],
                      chapter_id: chapter.id,
                      project_id,
                    }
                  )

                  if (insertVersesError) throw insertVersesError
                }
              }
            }
          }

          const { error: updateChaptersError } = await supabase.rpc(
            'update_chapters_in_books',
            {
              book_id: book.id,
              chapters: jsonFromGit,
              project_id,
            }
          )

          if (updateChaptersError) throw updateChaptersError
        }
        if (newResources && project_id && baseResource) {
          const { error: updateProjectFinal } = await updateProject(
            newResources,
            project_id,
            baseResource
          )
          if (updateProjectFinal) throw updateProjectFinal
        }
      } catch (error) {
        await sendLog({ place: 'api/projects/code/update_commits', error: error })

        res.status(404).json({ error })
        return
      }
      res.status(200).json({ message: 'Success' })
      break
    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
