import { supabase } from 'utils/supabaseClient'

/** Это пока что не работает */
export default async function languageProjectModeratorHandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)
  const {
    body: { project_id, prev_id },
    query: { id },
    method,
  } = req

  switch (method) {
    case 'PUT':
      try {
        // TODO валидацию
        const { data, error } = await supabase
          .from('project_coordinators')
          .update({ user_id: id })
          .match({ user_id: prev_id, role: 'coordinator', project_id: project_id })
        if (error) throw error
        res.status(200).json(data)
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      break
    case 'DELETE': //TODO проверить - работает ли и нужен ли
      try {
        const { data, error } = await supabase
          .from('project_coordinators')
          .delete()
          .match({ project_id: project_id, user_id: id })

        if (error) throw error
        res.status(200).json(data)
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
