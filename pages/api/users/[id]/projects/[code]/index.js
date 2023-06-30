import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

/** TODO тоже переделать */
export default async function userProjectHandler(req, res) {
  if (!req?.headers?.token) {
    return res.status(401).json({ error: 'Access denied!' })
  }
  const supabase = createPagesServerClient({ req, res })

  const {
    query: { code, id },
    method,
  } = req

  switch (method) {
    case 'GET':
      try {
        const { data, error } = await supabase
          .from('project_translators')
          .select('is_moderator,users!inner(id),projects!inner(code)')
          .eq('users.id', id)
          .eq('projects.code', code)
        if (error) throw error
        return res.status(200).json(data)
      } catch (error) {
        return res.status(404).json({ error })
      }
    default:
      res.setHeader('Allow', ['GET', 'PUT'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
