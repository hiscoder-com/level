import { supabase } from '../../utils/supabaseClient'

export default async function handler(req, res) {
  const { data, error } = await supabase.from('methods').select('*')
  if (error) {
    res.status(404).json({ error })
  }
  res.status(200).json({ data })
}
