import usfm from 'usfm-js'
import axios from 'axios'

import { supabase } from 'utils/supabaseClient'
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
      const { link, book_code, project_id } = req.body

      try {
        const jsonChapterVerse = await countOfChaptersAndVerses({
          link,
          book_code,
          project_id,
        })

        if (Object.keys(jsonChapterVerse).length !== 0) {
          const { error: errorPost } = await supabase.from('books').insert([
            {
              code: book_code,
              project_id,
              chapters: jsonChapterVerse,
            },
          ])
          if (errorPost) throw errorPost
        }

        res.status(201).json({})
      } catch (error) {
        res.status(404).json(error)
        return
      }
      break
    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
