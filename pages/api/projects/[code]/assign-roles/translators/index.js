import { supabase } from 'utils/supabaseClient'

/** TODO проверить */
export default async function languageProjectTranslatorsHandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)

  const {
    body,
    method,
    query: { code },
  } = req
  console.log(body)
  switch (method) {
    case 'GET':
      try {
        const { data, error } = await supabase
          .from('project_translators')
          .select(
            'is_moderator,projects!project_translators_project_id_fkey!inner(code),users!inner(*)'
          )
          .eq('projects.code', code)
        if (error) throw error
        res.status(200).json(data)
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      break
    case 'POST':
      try {
        const { project_id, user_id } = body
        // TODO валидацию
        const { data, error } = await supabase
          .from('project_translators')
          .insert([{ project_id, user_id }])
        if (error) throw error
        res.status(200).json(data)
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
