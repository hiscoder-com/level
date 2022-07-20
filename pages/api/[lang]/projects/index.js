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
      const { data: dataGet, error: errorGet } = await supabase
        .from('projects')
        .select('*,languages!inner(*)')
        .eq('languages.code', lang)
      if (errorGet) {
        res.status(404).json({ errorGet })
        return
      }

      res.status(200).json({ data: dataGet })
      break
    case 'POST':
      const { language_id, method_id, type, code, title } = body
      // TODO валидацию
      const { data: dataPost, error: errorPost } = await supabase
        .from('projects')
        .insert([{ language_id, method_id, type, code, title }])

      if (errorPost) {
        res.status(404).json({ errorPost })
      }
      res.setHeader('Location', `/projects/${dataPost[0].code}`)
      res.status(201).json({})
      break
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
