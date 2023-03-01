import { supabase } from 'utils/supabaseClient'

export default async function notesHandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)

  const { body, method } = req

  switch (method) {
    case 'GET':
      try {
        const { data, error } = await supabase
          .from('personal_notes')
          .select('*')
          .is('deleted_at', null)
          .order('changed_at', { ascending: false })
        if (error) throw error
        res.status(200).json(data)
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      break
    case 'POST':
      try {
        const { id, user_id } = body
        // TODO валидацию
        const { data, error } = await supabase.from('personal_notes').insert([
          {
            id,
            user_id,
            title: 'new note',
            data: {
              blocks: [
                {
                  type: 'paragraph',
                  data: {},
                },
              ],
              version: '2.8.1',
            },
          },
        ])
        if (error) throw error
        res.status(200).json(data)
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      break
    case 'DELETE':
      const { user_id } = body
      try {
        const { data, error } = await supabase
          .from('personal_notes')
          .update([{ deleted_at: new Date().toISOString().toLocaleString('en-US') }])
          .match({ user_id })

        if (error) throw error
        res.status(200).json(data)
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
