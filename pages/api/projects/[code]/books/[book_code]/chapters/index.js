import { supabase } from 'utils/supabaseClient'

export default async function chaptersHandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)

  let data = {}
  const {
    query: { code, book_code },
    method,
  } = req

  switch (method) {
    case 'GET':
      try {
        const { data: chapters, error } = await supabase
          .from('chapters')
          .select(
            'id, projects!inner(code), books!inner(code), num, verses,started_at, finished_at, text'
          )
          .match({ 'projects.code': code, 'books.code': book_code })

        if (error) throw error
        data = chapters
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      res.status(200).json(data)
      break
    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
