import { supabase } from 'utils/supabaseClient'

export default async function notesDeleteHandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)
  const {
    query: { id },
    body: { data: data_note, title },
    method,
  } = req

  switch (method) {
    case 'DELETE':
      try {
        const { data, error } = await supabase
          .from('dictionaries')
          .update([{ deleted_at: new Date().toISOString().toLocaleString('en-US') }])
          .match({ id })
        if (error) throw error
        res.status(200).json(data)
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      break

    case 'PUT':
      try {
        const { data, error } = await supabase
          .from('dictionaries')
          .update([{ data: data_note, title }])
          .match({ id })
        if (error) throw error
        res.status(200).json(data)
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      break

    default:
      res.setHeader('Allow', ['DELETE', 'PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
