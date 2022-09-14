import { supabase } from 'utils/supabaseClient'

export default async function userProjectshandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)
  let data = {}
  const {
    query: { id },
    method,
  } = req

  switch (method) {
    case 'GET':
      try {
        const { data: value, error } = await supabase
          .from('projects')
          .select('*,users!inner(id),project_roles!inner(*)')
          .eq('users.id', id)

        if (error) throw error
        data = value
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
