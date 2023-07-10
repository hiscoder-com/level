import supabaseApi from 'utils/supabaseServer'

export default async function chapterHandler(req, res) {
  let supabase
  try {
    supabase = await supabaseApi({ req, res })
  } catch (error) {
    return res.status(401).json({ error })
  }
  let data = {}
  const {
    query: { code, book_code, chapter_id },
    method,
  } = req
  switch (method) {
    case 'GET':
      try {
        const { data: chapter, error } = await supabase
          .from('chapters')
          .select(
            'id, num, text, started_at, finished_at, projects!inner(code), books!inner(code)'
          )
          .match({ 'projects.code': code, 'books.code': book_code, num: chapter_id })
          .single()
        if (error) throw error
        data = chapter
      } catch (error) {
        return res.status(404).json({ error })
      }
      return res.status(200).json(data)
    default:
      res.setHeader('Allow', ['GET'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
