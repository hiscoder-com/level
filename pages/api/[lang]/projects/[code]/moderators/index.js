import { supabase } from '@/utils/supabaseClient'

export default async function languageProjectModeratorsHandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)

  const {
    body: { project_id, user_id },
    method,
    query: { code },
  } = req

  let data = {}

  switch (method) {
    case 'GET':
      try {
        const { data: value, error } = await supabase
          .from('project_roles')
          .select('projects!inner(code),users!inner(*)')
          .eq('role', 'moderator')
          .eq('projects.code', code)
          .limit(1)
          .maybeSingle()
        if (error) throw error
        data = { ...value }
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      res.status(200).json(data)
      break
    case 'POST':
      try {
        const { data: value, error } = await supabase
          .from('project_roles')
          .insert([{ project_id, user_id, role: 'moderator' }])

        if (error) throw error
        data = { ...value }
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      res.status(200).json(data)
      break
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
