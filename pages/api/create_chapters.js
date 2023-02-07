import { supabase } from 'utils/supabaseClient'
import { supabaseService } from 'utils/supabaseServer'
import { countOfChaptersAndVerses } from 'utils/helper'

export default async function handler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
    return
  }
  supabase.auth.setAuth(req.headers.token)

  const { method } = req

  switch (method) {
    case 'POST':
      const sendLog = async (log) => {
        const { data, error } = await supabaseService.from('logs').insert({
          log,
        })
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

        res.status(201).json({})
      } catch (error) {
        await sendLog({
          url: 'api/create_chapters',
          type: 'error',
          error: error,
        })
        res.status(404).json(error)
        return
      }
      break
    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
