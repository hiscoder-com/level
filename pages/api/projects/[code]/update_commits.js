import { countOfChaptersAndVerses, parseManifests } from 'utils/helper'
import { supabase } from 'utils/supabaseClient'

export default async function languageProjectHandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)

  let data = {}
  const {
    query: { code },
    method,
    body: { resources, current_method, project_id },
  } = req

  const sendLog = async (log) => {
    const { data, error } = await supabase.from('logs').insert({
      log,
    })
    return { data, error }
  }

  switch (method) {
    case 'POST':
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

        const isEqualBaseResource =
          JSON.stringify(baseResourceDb.base_manifest) ===
          JSON.stringify({ resource: baseResource.name, books: baseResource.books })

        if (newResources && project_id && baseResource) {
          const { error } = await supabase
            .from('projects')
            .update({
              resources: newResources,
              base_manifest: {
                resource: baseResource.name,
                books: baseResource.books,
              },
            })
            .eq('id', project_id)
          if (error) {
            await sendLog(error)
            throw error
          }
        }

        if (isEqualBaseResource) {
          res.status(200).json({ ...data })
          return
        }

        const { data: books } = await supabase
          .from('books')
          .select('id,code,chapters')
          .eq('project_id', project_id)
        if (!books || books?.length === 0) {
          res.status(200).json({ ...data })
          return
        }
        for (const book of books) {
          const bookFromGit = baseResourceDb.base_manifest.books.find(
            (el) => el.name === book.code
          )
          const jsonfromGit = await countOfChaptersAndVerses({
            link: bookFromGit.link,
          })
          if (JSON.stringify(book.chapters) !== JSON.stringify(jsonfromGit)) {
            for (const key in jsonfromGit) {
              if (Object.hasOwnProperty.call(jsonfromGit, key)) {
                if (book.chapters[key]) {
                  if (jsonfromGit[key] > book.chapters[key]) {
                    await sendLog(
                      `Project #${project_id} - in ${book.code} chapter ${key} have more verses - ${jsonfromGit[key]} than before - ${book.chapters[key]} `
                    )
                    const { error: errorUpdateChapter } = await supabase
                      .from('chapters')
                      .update([{ verses: jsonfromGit[key] }])
                      .match({ book_id: book.id, num: key })
                    if (errorUpdateChapter) throw errorUpdateChapter

                    const { data: chapter, error } = await supabase
                      .from('chapters')
                      .select('id,started_at')
                      .eq('project_id', project_id)
                      .eq('book_id', book.id)
                      .eq('num', key)
                      .single()

                    if (chapter?.started_at) {
                      await sendLog(
                        `Project #${project_id} - in ${
                          book.code
                        } chapter ${key} already started and script added new verses from ${
                          book.chapters[key] + 1
                        } to ${jsonfromGit[key]}`
                      )
                      for (
                        let index = book.chapters[key] + 1;
                        index <= jsonfromGit[key];
                        index++
                      ) {
                        const { data: idStep, error: errorSteps } = await supabase
                          .from('steps')
                          .select('id')
                          .eq('project_id', 2)
                          .eq('sorting', 1)
                          .single()
                        const { data: dataLog, error: ErrorLog } = await supabase
                          .from('verses')
                          .insert({
                            chapter_id: chapter.id,
                            num: index,
                            project_id: project_id,
                            current_step: idStep.id,
                          })
                      }
                    }
                  }
                } else {
                  await sendLog(
                    `Project #${project_id} - in ${book.code} new chapter ${key}`
                  )
                  const { data, error } = await supabase.from('chapters').insert([
                    {
                      num: key,
                      verses: jsonfromGit[key],
                      book_id: book.id,
                      project_id: project_id,
                    },
                  ])
                }
              }
            }

            const { data: updateChapters, error: errorUpdateChapters } = await supabase
              .from('books')
              .update([{ chapters: jsonfromGit }])
              .match({ id: book.id })
            if (errorUpdateChapters) throw errorUpdateChapters
          }
        }
      } catch (error) {
        await sendLog({ place: 'api/projects/code/update_commits', error: error })

        res.status(404).json({ error })
        return
      }
      res.status(200).json({ ...data })
      break
    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
