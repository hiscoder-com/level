import { supabase } from '@/utils/supabaseClient'

export default async function methodsHandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)

  const { method } = req

  switch (method) {
    case 'GET':
      try {
        const { data, error } = await supabase.from('methods').select('*')
        if (error) throw error
        res.status(200).json(data)
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
