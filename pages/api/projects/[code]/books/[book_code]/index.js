import { supabase } from 'utils/supabaseClient'

export default async function bookHandler(req, res) {
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
        const { data: book, error } = await supabase
          .from('books')
          .select('id,code,projects!inner(code),properties, level_checks')
          .eq('projects.code', code)
          .eq('code', book_code)
          .single()

        if (error) throw error
        data = book
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
