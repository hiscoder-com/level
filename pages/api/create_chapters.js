import supabaseApi from 'utils/supabaseServer'
import { supabaseService } from 'utils/supabaseService'
import { countOfChaptersAndVerses } from 'utils/helper'

export default async function handler(req, res) {
  let supabase
  try {
    supabase = await supabaseApi({ req, res })
  } catch (error) {
    return res.status(401).json({ error })
  }
  const { method } = req

  switch (method) {
    case 'POST':
      const sendLog = async (log) => {
        const { data, error } = await supabaseService
          .from('logs')
          .insert({
            log,
          })
          .select()
        return { data, error }
      }
      const { link, book_code, project_id } = req.body

      try {
        const { data: jsonChapterVerse, error: errorJsonChapterVerse } =
          await countOfChaptersAndVerses({
            link,
            book_code,
          })

        if (errorJsonChapterVerse) {
          await sendLog({
            url: 'api/create_chapters',
            type: 'errorJsonChapterVerse',
            error: errorJsonChapterVerse,
          })
          throw errorJsonChapterVerse
        }

        if (Object.keys(jsonChapterVerse).length !== 0) {
          const { error: errorPost } = await supabase.from('books').insert([
            {
              code: book_code,
              project_id,
              chapters: jsonChapterVerse,
              properties: {
                scripture: {
                  h: '',
                  toc1: '',
                  toc2: '',
                  toc3: '',
                  mt: '',
                  chapter_label: '',
                },
                obs: {
                  title: '',
                  intro: '',
                  back: '',
                  chapter_label: '',
                },
              },
            },
          ])
          if (errorPost) throw errorPost
        }

        return res.status(201).json({})
      } catch (error) {
        await sendLog({
          url: 'api/create_chapters',
          type: 'error',
          error: error,
        })
        return res.status(404).json(error)
      }

    default:
      res.setHeader('Allow', ['POST'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
