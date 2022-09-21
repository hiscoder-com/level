import { supabase } from 'utils/supabaseClient'

export default async function languageProjectsHandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)
  const {
    query: { code },
    method,
  } = req
  switch (method) {
    case 'GET':
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*,languages!inner(*)')
          .eq('languages.code', code)
        if (error) throw error
        return res.status(200).json(data)
      } catch (error) {
        return res.status(404).json({ error })
      }
    default:
      res.setHeader('Allow', ['GET'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
