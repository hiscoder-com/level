import { supabaseClient } from 'utils/supabaseClient'

export default async function notesHandler(req, res) {
  if (!req?.headers?.token) {
    return res.status(401).json({ error: 'Access denied!' })
  }
  const supabase = supabaseClient(req.headers.token)

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
                version: '2.8.1',
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
