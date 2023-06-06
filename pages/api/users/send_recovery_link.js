import { supabase } from 'utils/supabaseClient'

export default async function sendRecoveryHandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)

  const {
    method,
    body: { email, url },
  } = req
  let data = ''
  switch (method) {
    case 'POST':
      try {
        const { data: dataSend, error } = await supabase.auth.api.resetPasswordForEmail(
          email,
          {
            redirectTo: `${url}/password-recovery`,
          }
        )
        data = dataSend
        if (error) throw error
      } catch (error) {
        if (error.status) {
          return res.status(error.status).json({ error })
        } else {
          return res.status(404).json({ error })
        }
      }
      res.status(201).json({ data })
      break
    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
