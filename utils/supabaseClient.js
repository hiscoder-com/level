import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import { useState } from 'react'

function useSupabaseClient() {
  const [supabaseClient] = useState(() =>
    createPagesBrowserClient({
      cookieOptions: {
        sameSite: 'lax',
      },
    })
  )
  return supabaseClient
}

export default useSupabaseClient
