import supabaseApi from 'utils/supabaseServer'
import axios from 'axios'

export default async function handler(req, res) {
  let supabase

  try {
    supabase = await supabaseApi({ req, res })
  } catch (error) {
    return res.status(401).json({ error })
  }
  const {
    body: { projectId, code, book, checkId, startDate, endDate, checkName },
  } = req
  console.log(projectId, code, book, checkId, startDate, endDate, checkName)
  const { method } = req
  const { data: project, error } = await supabase
    .from('projects')
    .select('comcheck_token,code')
    .eq('code', code)
    .single()
  if (error) throw error

  switch (method) {
    case 'POST':
      try {
        const response = await axios({
          method: 'post',
          url: `https://community-check.netlify.app/api/projects/${projectId}/books/${book}/checks/${checkId}`,
          data: {
            started_at: startDate,
            finished_at: endDate,
            name: checkName,
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
