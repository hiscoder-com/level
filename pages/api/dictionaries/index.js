import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

export default async function notesHandler(req, res) {
 
  const supabase = createPagesServerClient({ req, res })

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
