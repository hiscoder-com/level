import supabaseApi from 'utils/supabaseServer'

export default async function dictionariesInsertHandler(req, res) {
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
        const { word } = body

        const insertData = {
          id: word.id,
          project_id: word.project_id,
          title: word.title,
          data: word.data,
          created_at: word.created_at,
          changed_at: new Date(),
          deleted_at: word.deleted_at,
        }

        const { data, error } = await supabase
          .from('dictionaries')
          .insert([insertData])
          .select()

        if (error) throw error

        return res.status(200).json(data)
      } catch (error) {
        return res.status(400).json({ error })
      }
    default:
      res.setHeader('Allow', ['POST'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
