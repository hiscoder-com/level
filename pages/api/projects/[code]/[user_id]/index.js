import { supabase } from 'utils/supabaseClient'

export default async function languageProjectRolesHandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)

  const {
    method,
    query: { code, user_id },
  } = req
  let data
  switch (method) {
    case 'GET':
      let project_id
      try {
        const { data: id, error } = await supabase
          .from('projects')
          .select('id')
          .eq('code', code)
          .maybeSingle()
        if (error) throw error
        project_id = id.id
      } catch (error_id) {
        res.status(404).json({ error: error_id })
        return
      }
      try {
        const { data: role, error } = await supabase.rpc('authorize', {
          user_id,
          project_id,
        })
        if (error) throw error
        data = role
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
