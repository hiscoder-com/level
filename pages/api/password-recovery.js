import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

export default async function handler(req, res) {
  const {
    method,
    query: { token_hash, type, redirect_to },
  } = req

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
    case 'GET':
      try {
        const { error } = await supabase.auth.verifyOtp({
          token: token_hash,
          type: type,
        })
        if (error) throw error
        return res.redirect(302, redirect_to)
      } catch (error) {
        return res.status(404).json({ error })
      }
      break
    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
