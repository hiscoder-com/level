import { supabase } from 'utils/supabaseClient'

export default async function updatePasswordHandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)

  const {
    method,
    body: { password },
  } = req
  let data = ''
  switch (method) {
    case 'PUT':
      try {
        const { user, error } = await supabase.auth.update({ password })
        data = user
        if (error) throw error
      } catch (error) {
        return res.status(404).json({ error })
      }
      res.status(201).json({ data })
      break
    default:
      res.setHeader('Allow', ['PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
