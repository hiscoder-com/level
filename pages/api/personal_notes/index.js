import supabaseApi from 'utils/supabaseServer'

export default async function notesHandler(req, res) {
  let supabase
  try {
    supabase = await supabaseApi({ req, res })
  } catch (error) {
    return res.status(401).json({ error })
  }
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
        return res.status(200).json(data)
      } catch (error) {
        return res.status(404).json({ error })
      }
    case 'POST':
      try {
        const { id, user_id, isFolder, title } = body
        // TODO валидацию
        let insertData = {
          id,
          user_id,
          title,
          is_folder: isFolder,
        }

        if (!isFolder) {
          insertData.data = {
            blocks: [],
            version: '2.27.2',
          }
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
    case 'DELETE':
      const { user_id } = body
      try {
        const { data, error } = await supabase
          .from('personal_notes')
          .update([
            {
              deleted_at: new Date().toISOString().toLocaleString('en-US'),
              parent_id: null,
              sorting: null,
            },
          ])
          .match({ user_id })
          .select()

        if (error) throw error
        return res.status(200).json(data)
      } catch (error) {
        return res.status(404).json({ error })
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
