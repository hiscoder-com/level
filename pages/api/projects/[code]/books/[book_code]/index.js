import supabaseApi from 'utils/supabaseServer'

export default async function bookHandler(req, res) {
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
        const { data: book, error } = await supabase
          .from('books')
          .select('id,code,projects!inner(code),properties, level_checks')
          .eq('projects.code', code)
          .eq('code', book_code)
          .single()

        if (error) throw error
        data = book
      } catch (error) {
        return res.status(404).json({ error })
      }
      return res.status(200).json(data)
    default:
      res.setHeader('Allow', ['GET'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
