import { supabaseService } from 'utils/supabaseService'
import supabaseApi from 'utils/supabaseServer'

export default async function BooksIsNullLevelCheckHandler(req, res) {
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
        const { data, error } = await supabaseService.rpc(
          'get_books_not_null_level_checks',
          {
            project_code: code,
          }
        )
        if (error) throw error
        return res.status(200).json(data)
      } catch (error) {
        return res.status(404).json({ error })
      }
    default:
      res.setHeader('Allow', ['GET'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
