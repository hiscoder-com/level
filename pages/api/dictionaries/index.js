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
        const { id, project_id, placeholder } = body
        const { data, error } = await supabase
          .from('dictionaries')
          .insert([
            {
              id,
              project_id,
              title: placeholder,
              data: {
                blocks: [
                  {
                    type: 'paragraph',
                    data: {},
                  },
                ],
                version: '2.27.2',
              },
            },
          ])
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
