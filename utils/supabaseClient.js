import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
export const supabaseClient = (access_token) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    },
    auth: { persistSession: false },
  })
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
