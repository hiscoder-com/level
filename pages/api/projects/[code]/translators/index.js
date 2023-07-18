import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

export default async function languageProjectTranslatorsHandler(req, res) {
  if (!req?.headers?.token) {
    return res.status(401).json({ error: 'Access denied!' })
  }
  const supabase = createPagesServerClient({ req, res })

  const {
    body,
    method,
    query: { code },
  } = req

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
        } else {
          return res.status(404).json({ error: 'Missing id of project' })
        }
      } catch (error) {
        return res.status(404).json({ error })
      }

      try {
        const { data, error } = await supabase
          .from('project_translators')
          .insert([{ project_id, user_id }])
          .select()
        if (error) throw error
        return res.status(200).json(data)
      } catch (error) {
        return res.status(404).json({ error })
      }
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
