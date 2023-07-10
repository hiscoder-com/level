import supabaseApi from 'utils/supabaseServer'

export default async function chaptersHandler(req, res) {
  let supabase
  try {
    supabase = await supabaseApi({ req, res })
  } catch (error) {
    return res.status(401).json({ error })
  }
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
          .order('num', { ascending: true })
        if (error) throw error
        data = chapters
      } catch (error) {
        return res.status(404).json({ error })
      }
      return res.status(200).json(data)

    default:
      res.setHeader('Allow', ['GET'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
