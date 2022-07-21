import { supabase } from '@/utils/supabaseClient'

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

  switch (method) {
    case 'GET':
      try {
        const { data, error } = await supabase
          .from('project_roles')
          .select('projects!inner(code),users!inner(*)')
          .eq('role', 'translator')
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
          .from('project_roles')
          .insert([{ project_id, user_id, role: 'translator' }])
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
