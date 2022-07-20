import { supabase } from '@/utils/supabaseClient'
// TODO Это надо убрать
export default async function userConfessionHandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)

  const { body, method } = req

  switch (method) {
    case 'GET':
      break
    case 'PUT':
      const { user_id } = body

      // TODO валидацию
      const { data: dataPost, error: errorPost } = await supabase
        .from('users')
        .update({ confession: 'true' })
        .match({ id: user_id })

      if (errorPost) {
        res.status(404).json({ errorPost })
        return
      }

      res.status(200).json({ dataPost })
      break
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
