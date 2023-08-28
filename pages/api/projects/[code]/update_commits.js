import { countOfChaptersAndVerses, parseManifests } from 'utils/helper'
import supabaseApi from 'utils/supabaseServer'
import { supabaseService } from 'utils/supabaseService'

export default async function updateCommitsHandler(req, res) {
  let supabase
  try {
    supabase = await supabaseApi({ req, res })
  } catch (error) {
    return res.status(401).json({ error })
  }
  const {
    method,
    body: { resources, current_method, project_id },
  } = req

  const sendLog = async (log) => {
    const { data, error } = await supabaseService
      .from('logs')
      .insert({
        log,
      })
      .select()
    return { data, error }
  }

  switch (method) {
    case 'POST':
      const updateProject = async (newResources, project_id, baseResource) => {
        if (newResources && project_id && baseResource) {
          const { data, error } = await supabase.rpc('update_resources_in_projects', {
            resources_new: newResources,
            base_manifest_new: {
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

        const { data: baseResourceDb, error: baseManifestError } = await supabase
          .from('projects')
          .select('base_manifest')
          .eq('id', project_id)
          .single()
        if (baseManifestError) {
          await sendLog({
            url: 'api/projects/code/update_commits',
            type: 'base_manifest_error',
            error: baseManifestError,
          })
          throw baseManifestError
        }

        if (
          JSON.stringify(baseResourceDb.base_manifest) ===
          JSON.stringify({ resource: baseResource.name, books: baseResource.books })
        ) {
          await updateProject(newResources, project_id, baseResource)
          return res.status(200).json({ sucess: true })
        }
        const { data: books, error: booksError } = await supabase
          .from('books')
          .select('id,code,chapters')
          .eq('project_id', project_id)
        if (booksError) {
          await sendLog({
            url: 'api/projects/code/update_commits',
            type: 'booksError',
            error: booksError,
          })
          throw booksError
        }
        if (!books || books?.length === 0) {
          await updateProject(newResources, project_id, baseResource)
          return res.status(200).json({ sucess: true })
        }
        for (const book of books) {
          const bookFromGit = baseResource.books.find((el) => el.name === book.code)
          const { data: jsonFromGit, error: errorJsonFromGit } =
            await countOfChaptersAndVerses({
              link: bookFromGit.link,
              book_code: book.code,
            })
          if (errorJsonFromGit) {
            await sendLog({
              url: 'api/projects/code/update_commits',
              type: 'errorJsonFromGit',
              error: errorJsonFromGit,
            })
            throw errorJsonFromGit
          }

          if (JSON.stringify(book.chapters) === JSON.stringify(jsonFromGit)) {
            continue
          }
          await sendLog({
            url: 'api/projects/code/update_commits',
            type: 'check column chapters in books',
            warning: `In book ${
              book.code
            } project ${project_id} different values. Old value - ${JSON.stringify(
              book.chapters
            )}. New value - ${JSON.stringify(jsonFromGit)}`,
          })

          for (const key in jsonFromGit) {
            if (Object.hasOwnProperty.call(jsonFromGit, key)) {
              if (!book.chapters[key]) {
                await sendLog({
                  url: 'api/projects/code/update_commits',
                  type: 'Adding new chapter',
                  warning: `Project #${project_id} - in ${book.code} new chapter ${key}`,
                })
                const { error: insertVersesError } = await supabase.rpc(
                  'insert_additional_chapter',
                  {
                    book_id: book.id,
                    num: key,
                    verses: jsonFromGit[key],
                    project_id,
                  }
                )
                if (insertVersesError) {
                  await sendLog({
                    url: 'api/projects/code/update_commits',
                    type: 'insertVersesError',
                    error: insertVersesError,
                  })
                  throw insertVersesError
                }
                continue
              }
              if (jsonFromGit[key] > book.chapters[key]) {
                await sendLog({
                  url: 'api/projects/code/update_commits',
                  type: 'Adding new count verses in chapter',
                  warning: `Project #${project_id} - in ${book.code} chapter ${key} have more verses - new value: ${jsonFromGit[key]} than before - old value: ${book.chapters[key]}`,
                })

                const { data: chapter, error: chapterError } = await supabase.rpc(
                  'update_verses_in_chapters',
                  {
                    book_id: book.id,
                    verses_new: jsonFromGit[key],
                    num: key,
                    project_id,
                  }
                )
                if (chapterError) {
                  await sendLog({
                    url: 'api/projects/code/update_commits',
                    type: 'chapterError',
                    error: chapterError,
                  })
                  throw chapterError
                }

                if (chapter?.started_at) {
                  await sendLog({
                    url: 'api/projects/code/update_commits',
                    type: 'Insert new verses',
                    warning: `Project #${project_id} - in ${
                      book.code
                    } chapter ${key} already started and script added new verses from ${
                      book.chapters[key] + 1
                    } to ${jsonFromGit[key]}`,
                  })

                  const { error: insertVersesError } = await supabase.rpc(
                    'insert_additional_verses',
                    {
                      start_verse: book.chapters[key] + 1,
                      finish_verse: jsonFromGit[key],
                      chapter_id: chapter.id,
                      project_id,
                    }
                  )
                  if (insertVersesError) {
                    await sendLog({
                      url: 'api/projects/code/update_commits',
                      type: 'insertVersesError',
                      error: insertVersesError,
                    })
                    throw insertVersesError
                  }
                }
              }
            }
          }

          const { error: updateChaptersError } = await supabase.rpc(
            'update_chapters_in_books',
            {
              book_id: book.id,
              chapters_new: jsonFromGit,
              project_id,
            }
          )
          if (updateChaptersError) {
            await sendLog({
              url: 'api/projects/code/update_commits',
              type: 'updateChaptersError',
              error: updateChaptersError,
            })
            throw updateChaptersError
          }
        }

        const { error: updateProjectFinal } = await updateProject(
          newResources,
          project_id,
          baseResource
        )
        if (updateProjectFinal) {
          await sendLog({
            url: 'api/projects/code/update_commits',
            type: 'updateProjectFinal',
            error: updateProjectFinal,
          })
          throw updateProjectFinal
        }
      } catch (error) {
        await sendLog({
          url: 'api/projects/code/update_commits',
          type: 'base error of post request',
          error: error,
        })

        return res.status(404).json({ error })
      }
      return res.status(200).json({ message: 'Success' })

    default:
      res.setHeader('Allow', ['POST'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
