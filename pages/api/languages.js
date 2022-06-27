import { supabase } from '../../utils/supabaseClient'

export default async function handler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)
  const { data: languages, error } = await supabase.from('languages').select('*')
  if (error) {
    res.status(404).json({ error })
  }
  res.status(200).json({ languages, token: req.headers.token })
}
