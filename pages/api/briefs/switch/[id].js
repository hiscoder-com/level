import { supabase } from 'utils/supabaseClient'

export default async function briefsToggleHandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)
  const {
    query: { id },
    body: { is_enable },
    method,
  } = req

  switch (method) {
    case 'PUT':
      try {
        const { data, error } = await supabase
          .from('briefs')
          .update({ is_enable })
          .match({ project_id: id })
        if (error) throw error
        res.status(200).json(data)
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      break
    default:
      res.setHeader('Allow', ['PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
