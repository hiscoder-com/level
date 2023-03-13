import { supabase } from 'utils/supabaseClient'

export default async function versesHandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)

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
