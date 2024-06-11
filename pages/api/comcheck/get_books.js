import supabaseApi from 'utils/supabaseServer'
import axios from 'axios'

export default async function saveTokenHandler(req, res) {
  let supabase

  try {
    supabase = await supabaseApi({ req, res })
  } catch (error) {
    return res.status(401).json({ error })
  }
  const {
    query: { project_id, book_code },
  } = req
  const { method } = req
  const { data: project, error } = await supabase
    .from('projects')
    .select('comcheck_token,code')
    .eq('id', project_id)
    .single()
  if (error) throw error

  switch (method) {
    case 'GET':
      // console.log(project)
      try {
        const response = await axios.get(
          'https://community-check.netlify.app/api/projects',
          {
            headers: { 'x-comcheck-token': project.comcheck_token },
            accept: 'application/json',
          }
        )
        const currentProject = response.data.find((p) => p.name === project.code)
        if (!currentProject) throw new Error('Project not found')
        const responseBooks = await axios.get(
          'https://community-check.netlify.app/api/projects/' +
            currentProject.id +
            '/books',
          {
            headers: { 'x-comcheck-token': project.comcheck_token },
            accept: 'application/json',
          }
        )
        console.log(responseBooks.data)
        const currentBook = responseBooks.data.find((b) => b.name === book_code)
        if (!currentBook) throw new Error('Book not found')
        const responseChecks = await axios.get(
          'https://community-check.netlify.app/api/projects/' +
            currentProject.id +
            '/books/' +
            currentBook.id +
            '/checks',
          {
            headers: { 'x-comcheck-token': project.comcheck_token },
            accept: 'application/json',
          }
        )
        return res.status(200).json({
          checks: responseChecks.data,
          book: currentBook.id,
          project: currentProject.id,
        })
      } catch (error) {
        console.log(error)
        return res.status(404).json({ error })
      }
    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
