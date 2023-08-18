import supabaseApi from 'utils/supabaseServer'

export default async function projectRolesHandler(req, res) {
  let supabase
  try {
    supabase = await supabaseApi({ req, res })
  } catch (error) {
    return res.status(401).json({ error })
  }
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
      } catch (error) {
        return res.status(404).json({ error })
      }
      try {
        const { data: role, error } = await supabase.rpc('authorize', {
          user_id,
          project_id,
        })
        if (error) throw error
        data = role
      } catch (error) {
        return res.status(404).json({ error })
      }
      return res.status(200).json(data)
    default:
      res.setHeader('Allow', ['GET'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
