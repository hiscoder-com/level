import usfm from 'usfm-js'
import axios from 'axios'

import { supabase } from 'utils/supabaseClient'

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
      const countOfChaptersAndVerses = {}
      try {
        const result = await axios.get(link)

        const jsonData = usfm.toJSON(result.data)
        if (Object.entries(jsonData?.chapters).length > 0) {
          Object.entries(jsonData?.chapters).forEach((el) => {
            countOfChaptersAndVerses[el[0]] = Object.keys(el[1]).filter(
              (verse) => verse !== 'front'
            ).length
          })
        }

        if (Object.keys(countOfChaptersAndVerses).length !== 0) {
          const { error: errorPost } = await supabase.from('books').insert([
            {
              code: book_code,
              project_id,
              chapters: countOfChaptersAndVerses,
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
