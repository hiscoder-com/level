import supabaseApi from 'utils/supabaseServer'

export default async function handler(req, res) {
  try {
    let supabase
    try {
      supabase = await supabaseApi({ req, res })
      console.log(req, 12)
    } catch (error) {
      return res.status(401).json({ error })
    }
    const { searchQuery = '', count = 0, project_id: projectId } = req.query

    if (!projectId) {
      return res.status(400).json({ message: 'Missing project ID' })
    }

    const { data, error } = await supabase.rpc('get_words', {
      search_query: searchQuery,
      count: count,
      project_id_param: projectId,
    })

    if (error) throw error
    return res.status(200).json(data)
  } catch (error) {
    return res.status(404).json({ error: error.message })
  }
}
