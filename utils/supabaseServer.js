import { createServerClient } from '@supabase/ssr'
import { getCookie } from 'cookies-next'

const supabaseApi = async ({ req, res }) => {
  const cookieStore = {
    get(name) {
      return getCookie(name, { req, res })
    },
  }

  const supabaseServerApi = createServerClient(
    process.env.SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: cookieStore,
    }
  )

  try {
    const {
      data: { session },
    } = await supabaseServerApi.auth.getSession()

    if (!session) {
      throw Error('Access denied!')
    }
  } catch (error) {
    throw error
  }

  return supabaseServerApi
}

export default supabaseApi
