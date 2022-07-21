import { supabase } from '@/utils/supabaseClient'

export default async function languageProjectModeratorHandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)

  let data = {}
  const {
    body: { prev_id },
    query: { id },
    method,
  } = req
  switch (method) {
    case 'PUT':
      try {
        const { data: value, error } = await supabase
          .from('project_roles')
          .update({ user_id: id })
          .match({ user_id: prev_id, role: 'moderator' })

        if (error) throw error
        data = value
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      res.status(200).json(data)

      break
    case 'DELETE': //TODO проверить - работает ли и нужен ли
      try {
        const { data: value, error } = await supabase
          .from('project_roles')
          .delete()
          .match({ project_id: body.projectId, role: 'moderator', user_id: id })

        if (error) throw error
        data = value
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      res.status(200).json(data)
      break
    default:
      res.setHeader('Allow', ['PUT', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
