import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

export default async function sendRecoveryHandler(req, res) {
  const {
    method,
    body: { email, url },
  } = req
  let data = ''
  const supabase = createPagesServerClient(
    { req, res },
    {
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseUrl: process.env.SUPABASE_URL,
      cookieOptions: {
        name: process.env.NEXT_PUBLIC_COOKIE_NAME ?? 'sb-vcana-cookies',
      },
    }
  )
  switch (method) {
    case 'POST':
      try {
        const { data: dataSend, error } = await supabase.auth.resetPasswordForEmail(
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
      res.status(200).json({ data })
      break
    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
