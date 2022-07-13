import { supabase } from '../../../../../utils/supabaseClient'

export default async function languageProjectRolesHandler(req, res) {
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
      const { data: dataGet, error: errorGet } = await supabase
        .from('project_roles')
        .select('role,projects!inner(code),users!inner(*)')
        .eq('projects.code', code)
      if (errorGet) {
        res.status(404).json({ errorGet })
        return
      }
      res.status(200).json({ data: dataGet })
      break
    case 'POST':
      const { project_id, user_id } = body
      // TODO валидацию

      const { data: dataPost, error: errorPost } = await supabase
        .from('project_roles')
        .insert([{ project_id, user_id, role: 'coordinator' }])

      if (errorPost) {
        res.status(404).json({ errorPost })
        return
      }

      res.status(200).json({ dataPost })
      break
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
