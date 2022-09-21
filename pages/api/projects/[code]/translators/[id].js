import { supabase } from 'utils/supabaseClient'

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
    case 'DELETE':
      try {
        const { data, error } = await supabase
          .from('project_translators')
          .delete()
          .match({ project_id: body.projectId, user_id: id })

        if (error) throw error
        res.status(200).json(data)
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      break
    default:
      res.setHeader('Allow', ['DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
