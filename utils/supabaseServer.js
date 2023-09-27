import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

const supabaseApi = async ({ req, res, isAuth = true }) => {
  let supabaseServerApi
  try {
    supabaseServerApi = createPagesServerClient(
      { req, res },
      {
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        supabaseUrl: process.env.SUPABASE_URL,
        cookieOptions: {
          name: process.env.NEXT_PUBLIC_COOKIE_NAME ?? 'sb-vcana-cookies',
        },
      }
    )
    if (isAuth) {
      const {
        data: { session },
      } = await supabaseServerApi.auth.getSession()
      if (!session) {
        throw Error('Access denied!')
      }
    }
  } catch (error) {
    throw error
  }
  return supabaseServerApi
}

export default supabaseApi
