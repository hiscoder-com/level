import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

export default async function handler(req, res) {
  const {
    query: { token_hash, type, redirect_to, email },
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

  try {
    const { error } = await supabase.auth.verifyOtp({
      token: token_hash,
      type,
      email,
    })
    if (error) throw error
    return res.redirect(302, redirect_to)
  } catch (error) {
    return res.status(404).json({ error })
  }
}
