import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

export default async function updatePasswordHandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  const supabase = createPagesServerClient({ req, res })

  const {
    method,
    body: { password },
  } = req
  let data = ''
  switch (method) {
    case 'PUT':
      try {
        const { user, error } = await supabase.auth.updateUser({ password })
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
