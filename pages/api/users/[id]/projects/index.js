import { supabase } from '@/utils/supabaseClient'

export default async function userProjectshandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)

  const {
    query: { id },
    method,
  } = req

  switch (method) {
    case 'GET': //TODO проверить используется или нет
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*,users!inner(*),project_roles!inner(*)')
          .eq('users.id', id)
        if (error) throw error
        res.status(200).json(data)
      } catch (error) {
        res.status(404).json({ error })
        return
      }
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
