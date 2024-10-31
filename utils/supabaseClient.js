import { useState } from 'react'

import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'

function useSupabaseClient() {
  const [supabaseClient] = useState(() =>
    createPagesBrowserClient({
      cookieOptions: {
        name: process.env.NEXT_PUBLIC_COOKIE_NAME ?? 'sb-level-cookies',
        sameSite: 'lax',
      },
    })
  )
  return supabaseClient
}

export default useSupabaseClient
