import { supabase } from '@/utils/supabaseClient'

export default async function languageProjectTranslatorHandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)
  const {
    body,
    query: { id },
    method,
  } = req
  switch (method) {
    case 'GET':
      break
    case 'PUT':
      break
    case 'DELETE':
      const { data, error } = await supabase
        .from('project_roles')
        .delete()
        .match({ project_id: body.projectId, role: 'translator', user_id: id })
      if (error) {
        res.status(404).json({ error })
        return
      }

      res.status(200).json({ data })

      break
    default:
      res.setHeader('Allow', ['GET', 'PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
