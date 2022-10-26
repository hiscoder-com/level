import { supabase } from 'utils/supabaseClient'

export default async function briefsGetHandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)
  const {
    query: { id },
    body: { text },
    method,
  } = req
  switch (method) {
    case 'GET':
      try {
        const { data, error } = await supabase
          .from('briefs')
          .select('*')
          .eq('project_id', id)
          .maybeSingle()

        if (error) throw error
        console.log(data)
        res.status(200).json(data)
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      break
    case 'PUT':
      try {
        const { data, error } = await supabase
          .from('briefs')
          .update(text)
          .match({ id })
        if (error) throw error
        res.status(200).json(data)
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'DELETE', 'PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
