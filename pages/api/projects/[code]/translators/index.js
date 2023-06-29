import { supabase } from 'utils/supabaseClient'

export default async function languageProjectTranslatorsHandler(req, res) {
  if (!req?.headers?.token) {
    return res.status(401).json({ error: 'Access denied!' })
  }
  try {
    supabase.auth.setAuth(req.headers.token)
  } catch (error) {
    return res.status(404).json({ error })
  }

  let body, method, code

  try {
    body = req.body
    method = req.method
    code = req.query.code
  } catch (error) {
    return res.status(404).json({ error })
  }

  let project_id = null
  switch (method) {
    case 'GET':
      try {
        const { data, error } = await supabase
          .from('project_translators')
          .select('id, is_moderator, projects!inner(code), users!inner(*)')
          .eq('projects.code', code)
          .order('id', { ascending: true })
        if (error) throw error
        return res.status(200).json(data)
      } catch (error) {
        return res.status(404).json({ error })
      }
    case 'POST':
      const { user_id } = body
      try {
        const { data: project, error } = await supabase
          .from('projects')
          .select('id, code')
          .eq('code', code)
          .limit(1)
          .maybeSingle()
        if (error) throw error
        if (project?.id) {
          project_id = project?.id
        }
      } catch (error) {
        return res.status(404).json({ error })
      }
      if (!project_id) {
        return res.status(404).json({ error: 'Missing id of project' })
      }
      try {
        const { data, error } = await supabase
          .from('project_translators')
          .insert([{ project_id, user_id }])
        if (error) throw error
        return res.status(200).json(data)
      } catch (error) {
        return res.status(404).json({ error })
      }
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
