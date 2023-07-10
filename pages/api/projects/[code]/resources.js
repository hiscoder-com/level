import supabaseApi from 'utils/supabaseServer'

export default async function resourcesProjectHandler(req, res) {
  let supabase
  try {
    supabase = await supabaseApi({ req, res })
  } catch (error) {
    return res.status(401).json({ error })
  }
  let data = {}
  const {
    query: { code },
    method,
  } = req
  switch (method) {
    case 'GET':
      try {
        const { data: value, error } = await supabase
          .from('projects')
          .select('resources')
          .eq('code', code)
          .single()
        if (error) throw error
        data = value.resources
      } catch (error) {
        return res.status(404).json({ error })
      }
      return res.status(200).json({ ...data })
    default:
      res.setHeader('Allow', ['GET'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
