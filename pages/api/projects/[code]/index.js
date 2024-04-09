import supabaseApi from 'utils/supabaseServer'

export default async function projectHandler(req, res) {
  let supabase
  try {
    supabase = await supabaseApi({ req, res })
  } catch (error) {
    return res.status(401).json({ error })
  }
  let data = {}
  const {
    query: { code },
    body: { basicInfo },
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
      const { code: new_code, title, orig_title, language_id, is_rtl } = basicInfo

      try {
        const { error } = await supabase.rpc('update_project_basic', {
          language_id,
          orig_title,
          title,
          code: new_code,
          project_code: code,
          is_rtl,
        })
        if (error) throw error

        return res.status(200).json({ success: 'updated' })
      } catch (error) {
        return res.status(404).json({ error })
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
