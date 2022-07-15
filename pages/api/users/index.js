import { supabase } from '@/utils/supabaseClient'

export default async function usersHandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)

  try {
    const { data, error } = await supabase.from('users').select('*')
    if (error) throw error
    res.status(200).json(data)
  } catch (error) {
    res.status(404).json({ error })
    return
  }
}
