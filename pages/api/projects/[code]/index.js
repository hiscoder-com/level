import { supabase } from 'utils/supabaseClient'

export default async function projectHandler(req, res) {
  if (!req.headers.token) {
    return res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)

  let data = {}
  const {
    query: { code },
    body: basicInfo,
    method,
  } = req
  switch (method) {
    case 'GET':
      try {
        const { data: value, error } = await supabase
          .from('projects')
          .select(
            'id, title, orig_title, code, type, method, languages(id,orig_name,code), dictionaries_alphabet, base_manifest'
          )
          .eq('code', code)
          .maybeSingle()
        if (error) throw error
        data = value
      } catch (error) {
        return res.status(404).json({ error })
      }
      return res.status(200).json({ ...data })
      break
    case 'PUT':
      try {
        const { data: project, errorGetProject } = await supabase
          .from('projects')
          .select('id')
          .eq('code', code)
          .maybeSingle()
        if (errorGetProject) throw errorGetProject
        const { data: value, error } = await supabase
          .from('projects')
          .update(basicInfo)
          .eq('id', project.id)
        if (error) throw error
        data = value
      } catch (error) {
        return res.status(404).json({ error })
      }
      return res.status(200).json({ data })

    default:
      res.setHeader('Allow', ['GET'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
