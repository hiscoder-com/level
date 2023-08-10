import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

export default async function projectHandler(req, res) {
  if (!req?.headers?.token) {
    return res.status(401).json({ error: 'Access denied!' })
  }
  const supabase = createPagesServerClient({ req, res })

  let data = {}
  const {
    query: { code },
    body: { basicInfo, user_id },
    method,
  } = req
  switch (method) {
    case 'GET':
      try {
        const { data: value, error } = await supabase
          .from('projects')
          .select(
            'id, title, orig_title, code, type, method, languages(id,orig_name,code), dictionaries_alphabet, base_manifest'
          )
          .eq('code', code)
          .maybeSingle()
        if (error) throw error
        data = value
      } catch (error) {
        return res.status(404).json({ error })
      }
      return res.status(200).json({ ...data })
    case 'PUT':
      const { code: new_code, title, orig_title, language_id } = basicInfo

      try {
        const { error } = await supabase.rpc('update_project_basic', {
          language_id,
          orig_title,
          title,
          code: new_code,
          project_code: code,
          user_id,
        })
        if (error) throw error
      } catch (error) {
        return res.status(404).json({ error })
      }
      return res.status(200).json({ success: 'updated' })

    default:
      res.setHeader('Allow', ['GET', 'PUT'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
