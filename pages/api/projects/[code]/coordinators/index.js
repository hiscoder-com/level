import { supabase } from 'utils/supabaseClient'

export default async function languageProjectCoordinatorsHandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)

  let data = {}
  let project_id = null

  const {
    body,
    method,
    query: { code },
  } = req
  switch (method) {
    case 'GET':
      try {
        const { data: value, error } = await supabase
          .from('project_coordinators')
          .select('projects!inner(code),users!inner(*)')
          .eq('projects.code', code)

        if (error) throw error
        data = value
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      res.status(200).json(data)
      break
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
        res.status(404).json({ error })
      }
      if (!project_id) {
        res.status(404).json({ error: 'Missing id of project' })
        return
      }
      try {
        const { data: project, error: post_error } = await supabase
          .from('projects')
          .select('id, code')
          .eq('code', code)
          .limit(1)
          .maybeSingle()
        if (post_error) throw post_error
        if (!project?.id) {
          return
        }
        const { data: value, error } = await supabase
          .from('project_coordinators')
          .insert([{ project_id, user_id }])
        if (error) throw error
        data = value
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
