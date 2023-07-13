import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

export default async function briefsToggleHandler(req, res) {
  if (!req?.headers?.token) {
    return res.status(401).json({ error: 'Access denied!' })
  }
  const supabase = createPagesServerClient({ req, res })
  const {
    query: { id },
    body: { is_enable },
    method,
  } = req

  switch (method) {
    case 'PUT':
      try {
        const { data, error } = await supabase
          .from('briefs')
          .update({ is_enable })
          .match({ project_id: id })
          .select()
        if (error) throw error
        return res.status(200).json(data)
      } catch (error) {
        return res.status(404).json({ error })
      }
    default:
      res.setHeader('Allow', ['PUT'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
