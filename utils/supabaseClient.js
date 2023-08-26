import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import { useState } from 'react'

function useSupabaseClient() {
  const [supabaseClient] = useState(() =>
    createPagesBrowserClient({
      cookieOptions: {
        name: process.env.NEXT_PUBLIC_COOKIE_NAME ?? 'sb-vcana-cookies',
        sameSite: 'lax',
      },
    })
  )
  return supabaseClient
}

export default useSupabaseClient
