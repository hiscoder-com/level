import { handleAuth } from '@supabase/supabase-auth-helpers/nextjs'

export default handleAuth({
  logout: { returnTo: '/' },
  cookieOptions: { lifetime: 1 * 365 * 24 * 60 * 60 },
})
