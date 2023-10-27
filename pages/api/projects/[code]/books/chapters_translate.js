import { supabaseService } from 'utils/supabaseService'
import supabaseApi from 'utils/supabaseServer'

export default async function ChaptersTranslateHandler(req, res) {
  let supabase
  try {
    supabase = await supabaseApi({ req, res })
  } catch (error) {
    return res.status(401).json({ error })
  }
  const {
    query: { code },
    method,
  } = req

  switch (method) {
    case 'GET':
      try {
        const { data: booksData, error: booksError } = await supabaseService.rpc(
          'get_books_not_null_level_checks',
          {
            project_code: code,
          }
        )
        const { data: chaptersData, error: chaptersError } = await supabaseService.rpc(
          'find_books_with_chapters_and_verses',
          {
            project_code: code,
          }
        )
        if (chaptersError || booksError) {
          return res.status(404).json({ booksError, chaptersError })
        }

        const combinedData = [...booksData, ...chaptersData]

        return res.status(200).json(combinedData)
      } catch (error) {
        return res.status(404).json({ error })
      }
    default:
      res.setHeader('Allow', ['GET'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
