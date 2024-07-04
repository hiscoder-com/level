import supabaseApi from 'utils/supabaseServer'

export default async function handler(req, res) {
  try {
    let supabase
    try {
      supabase = await supabaseApi({ req, res })
    } catch (error) {
      return res.status(401).json({ error })
    }

    const {
      searchQuery = '',
      wordsPerPage = 10,
      pageNumber = 0,
      project_id_param,
    } = req.query

    if (!project_id_param) {
      return res.status(400).json({ message: 'Missing project ID' })
    }

    const { data, error } = await supabase.rpc('get_words_page', {
      search_query: searchQuery,
      words_per_page: wordsPerPage,
      page_number: pageNumber,
      project_id_param,
    })

    if (error) throw error
    return res.status(200).json(data)
  } catch (error) {
    return res.status(404).json({ error: error.message })
  }
}
