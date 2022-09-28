import { supabase } from 'utils/supabaseClient'

/** TODO надо переписать */
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
          .from('project_translators')
          .select(
            'is_moderator,projects!project_translators_project_id_fkey!inner(code),users!inner(*)'
          )
          .eq('projects.code', code)
          .eq('is_moderator', true)

        if (error) throw error
        data = [...value]
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      res.status(200).json(data)
      break
    case 'POST':
      try {
        const { data: value, error } = await supabase
          .from('project_moderators')
          .insert([{ project_id, user_id }])

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
