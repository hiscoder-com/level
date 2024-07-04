import supabaseApi from 'utils/supabaseServer'

export default async function languageProjectTranslatorHandler(req, res) {
  let supabase
  try {
    supabase = await supabaseApi({ req, res })
  } catch (error) {
    return res.status(401).json({ error })
  }
  const {
    query: { code, id },
    method,
  } = req
  let project_id = null
  switch (method) {
    case 'DELETE':
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
        } else {
          throw { error: 'Missing id of project' }
        }
      } catch (error) {
        return res.status(404).json({ error })
      }
      try {
        const { data, error } = await supabase
          .from('project_translators')
          .delete()
          .match({ project_id: project_id, user_id: id })
          .select()
        if (error) throw error
        return res.status(200).json(data)
      } catch (error) {
        return res.status(404).json({ error })
      }
    default:
      res.setHeader('Allow', ['DELETE'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
