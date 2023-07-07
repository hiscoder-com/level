import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

export default async function languageProjectRolesHandler(req, res) {
 
  const supabase = createPagesServerClient({ req, res })

  const {
    method,
    query: { code },
  } = req

  switch (method) {
    case 'GET':
      try {
        const { data: value, error } = await supabase
          .from('project_translators')
          .select('role,projects!inner(code),users!inner(*)')
          .eq('projects.code', code)
        if (error) throw error
        data = value
      } catch (error) {
        return res.status(404).json({ error })
      }
      return res.status(200).json(data)

    default:
      res.setHeader('Allow', ['GET'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
