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
    case 'POST':
      try {
        const { id, project_id, isFolder, title } = body
        let insertData = {
          id,
          project_id,
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
          .from('team_notes')
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
