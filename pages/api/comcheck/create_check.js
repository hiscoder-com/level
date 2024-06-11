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
    body: { projectId, bookName, checkName },
  } = req
  const { method } = req
  const { data: project, error } = await supabase
    .from('projects')
    .select('comcheck_token,code')
    .eq('id', projectId)
    .single()
  if (error) throw error

  switch (method) {
    case 'POST':
      console.log(project, projectId, bookName, checkName)
      try {
        const response = await axios({
          method: 'post',
          url: 'https://community-check.netlify.app/api/projects/fast',
          data: {
            check_name: checkName,
            book_name: bookName,
            project_name: project.code,
          },
          headers: {
            'x-comcheck-token': project.comcheck_token,
            'Content-Type': 'application/json',
            accept: 'application/json',
          },
        })

        console.log(response.data)
        return res.status(200).json(response.data)
      } catch (error) {
        console.log(error)
        return res.status(404).json({ error })
      }
    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
