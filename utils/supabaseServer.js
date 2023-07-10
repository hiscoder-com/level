import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

const supabaseApi = ({ req, res }) =>
  createPagesServerClient(
    { req, res },
    {
      cookieOptions: {
        name: process.env.NEXT_PUBLIC_COOKIE_NAME ?? 'sb-vcana-cookies',
      },
    }
  )

export default supabaseApi
