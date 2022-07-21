import { supabase } from '@/utils/supabaseClient'

export default async function userHandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)

  const {
    query: { id },
    method,
  } = req

  switch (method) {
    case 'GET':
      try {
        const { data, error } = await supabase.from('users').select('*').eq('id', id)
        if (error) throw error
        res.status(200).json(data[0])
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
