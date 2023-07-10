import supabaseApi from 'utils/supabaseServer'

export default async function booksHandler(req, res) {
  let supabase
  try {
    supabase = await supabaseApi({ req, res })
  } catch (error) {
    return res.status(401).json({ error })
  }
  let data = {}
  const {
    query: { code },
    method,
  } = req
  switch (method) {
    case 'GET':
      try {
        const { data: books, error } = await supabase
          .from('books')
          .select('id, projects!inner(code), code, chapters, properties, level_checks')
          .eq('projects.code', code)

        if (error) throw error
        data = books
      } catch (error) {
        return res.status(404).json({ error })
      }
      return res.status(200).json(data)
    default:
      res.setHeader('Allow', ['GET'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
