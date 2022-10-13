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
        const { data, error } = await supabase.from('personal_notes').select('*')
        if (error) throw error
        res.status(200).json(data)
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      break
    case 'POST':
      try {
        const { id, user_id } = body // тело запроса
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
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
