import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

export default async function versesHandler(req, res) {
  if (!req?.headers?.token) {
    return res.status(401).json({ error: 'Access denied!' })
  }
  const supabase = createPagesServerClient({ req, res })
  let data = {}
  const {
    query: { code, chapter_id },
    method,
  } = req
  switch (method) {
    case 'GET':
      try {
        const { data: verses, error } = await supabase
          .from('verses')
          .select(
            'id, projects!inner(code), num, text, current_step, project_translator_id'
          )
          .match({ 'projects.code': code, chapter_id })
        if (error) throw error
        data = verses
      } catch (error) {
        return res.status(404).json({ error })
      }
      return res.status(200).json(data)
    default:
      res.setHeader('Allow', ['GET'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
