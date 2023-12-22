import supabaseApi from 'utils/supabaseServer'

export default async function bulkHandler(req, res) {
  let supabase
  try {
    supabase = await supabaseApi({ req, res })
  } catch (error) {
    return res.status(401).json({ error })
  }
  const { body, method } = req

  switch (method) {
    case 'POST':
      try {
        const { note } = body
        let insertData = {
          id: note.id,
          user_id: note.user_id,
          title: note.title,
          data: note.data,
          created_at: note.created_at,
          changed_at: note.changed_at,
          deleted_at: note.deleted_at,
          is_folder: note.is_folder,
          parent_id: note.parent_id,
          sorting: note.sorting,
        }

        const { data, error } = await supabase
          .from('personal_notes')
          .insert([insertData])
          .select()
        if (error) throw error
        return res.status(200).json(data)
      } catch (error) {
        return res.status(404).json({ error })
      }
    default:
      res.setHeader('Allow', ['POST'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
