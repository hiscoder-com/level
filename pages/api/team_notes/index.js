import { supabase } from 'utils/supabaseClient'

/** TODO проверить */
export default async function notesHandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)

  const { body, method } = req
  switch (method) {
    case 'POST':
      try {
        const { data: data_note, title, isFolder, parent_id, project_id, id } = body
        const { data, error } = await supabase.from('team_notes').insert([
          {
            id,
            project_id,
            title,
            is_folder: isFolder,
            parent_id,
            data: data_note,
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
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
