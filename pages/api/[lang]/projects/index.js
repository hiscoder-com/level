import { supabase } from '@/utils/supabaseClient'

export default async function languageProjectsHandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)

  const {
    query: { lang },
    body,
    method,
  } = req

  switch (method) {
    case 'GET':
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*,languages!inner(*)')
          .eq('languages.code', lang)
        if (error) throw error
        res.status(200).json(data)
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      break
    case 'POST':
      try {
        const { language_id, method_id, type, code, title } = body
        const { data, error } = await supabase
          .from('projects')
          .insert([{ language_id, method_id, type, code, title }])
        if (error) throw error
        res.setHeader('Location', `/projects/${data[0].code}`)
        res.status(201).json({})
      } catch (error) {
        res.status(404).json({ error })
      }
      // TODO валидацию
      break
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
