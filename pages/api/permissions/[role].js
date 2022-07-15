import { supabase } from '@/utils/supabaseClient'

export default async function rolePermissionHandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)

  const {
    query: { role },
    method,
  } = req
  switch (method) {
    case 'GET':
      try {
        const { data, error } = await supabase
          .from('role_permissions')
          .select('permission')
          .eq('role', role)
        if (error) throw error
        res.status(200).json(data)
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      break
    case 'PUT':
      res.status(200).json({ code: `Project ${code}` })
      break
    default:
      res.setHeader('Allow', ['GET', 'PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
