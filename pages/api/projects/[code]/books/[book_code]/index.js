import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

export default async function bookHandler(req, res) {
  if (!req?.headers?.token) {
    return res.status(401).json({ error: 'Access denied!' })
  }
  const supabase = createPagesServerClient({ req, res })

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
