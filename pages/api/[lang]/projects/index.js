import { supabase } from 'utils/supabaseClient'

export default async function languageProjectsHandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)

  const {
    query: { lang },
    body: { language_id, method_id, type, code, title },
    method,
  } = req

  let data = {}

  switch (method) {
    case 'GET':
      try {
        const { data: value, error } = await supabase
          .from('projects')
          .select('*,languages!inner(*)')
          .eq('languages.code', lang)
        if (error) throw error
        data = value
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      res.status(200).json(data)
      break
    case 'POST':
      try {
        const { data: value, error } = await supabase
          .from('projects')
          .insert([{ language_id, method_id, type, code, title }])
        if (error) throw error
        data = value
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      res.setHeader('Location', `/projects/${data[0].code}`)
      res.status(201).json({})
      break
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
