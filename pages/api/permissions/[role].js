import { supabase } from 'utils/supabaseClient'

export default async function rolePermissionHandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)
  let data = {}
  const {
    query: { role },
    method,
  } = req
  switch (method) {
    case 'GET':
      try {
        const { data: value, error } = await supabase
          .from('role_permissions')
          .select('permission')
          .eq('role', role)
        if (error) throw error
        data = value
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      res.status(200).json(data)
      break
    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
