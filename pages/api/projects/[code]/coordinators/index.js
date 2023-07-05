import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

export default async function languageProjectCoordinatorsHandler(req, res) {
  if (!req?.headers?.token) {
    return res.status(401).json({ error: 'Access denied!' })
  }
  const supabase = createPagesServerClient({ req, res })

  let data = {}

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
          .select('id, projects!inner(code), users!inner(*)')
          .eq('projects.code', code)
          .order('id', { ascending: true })
        if (error) throw error
        data = value
      } catch (error) {
        return res.status(404).json({ error })
      }
      return res.status(200).json(data)
    case 'POST':
      const { user_id } = body
      let project_id = null
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
          return res.status(404).json({ error: 'Missing id of project' })
        }
      } catch (error) {
        return res.status(404).json({ error })
      }

      try {
        const { data: value, error } = await supabase
          .from('project_coordinators')
          .insert([{ project_id, user_id }])
          .select()
        if (error) throw error
        data = value
      } catch (error) {
        return res.status(404).json({ error })
      }
      return res.status(200).json(data)

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
