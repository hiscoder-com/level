import { supabase, supabaseService } from '../../utils/supabaseClient'

export default async function handler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)

  const {
    body: { email, password, userName },
    method,
  } = req

  switch (method) {
    case 'GET':
      const { date: dataGet, error: errorGet } = await supabase.from('users').select('*')
      if (errorGet) {
        res.status(404).json({ errorGet })
      }
      res.status(200).json({ ...dataGet })
      break
    case 'POST':
      // TODO валидацию
      const { data: dataPost, error: errorPost } =
        await supabaseService.auth.api.createUser({
          email,
          password,
          user_metadata: { userName },
        })
      if (errorPost) {
        res.status(404).json({ errorPost })
      }
      res.setHeader('Location', `/users/${dataPost[0].user_name}`)
      res.status(201).json({})
      break
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
