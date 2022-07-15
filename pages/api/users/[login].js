import { supabase } from '../../../utils/supabaseClient'
import { supabaseService } from '../../../utils/supabaseServer'

export default async function handler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)

  const {
    query: { login },
    body: { blocked },
    method,
  } = req

  switch (method) {
    case 'GET':
      const { data: user, error: errorGet } = await supabase
        .from('users')
        .select('login, email, blocked, agreement, confession, is_admin')
        .eq('login', login)
      if (errorGet) {
        res.status(404).json({ error: errorGet })
      }
      res.status(200).json(user?.[0])
      break
    case 'POST':
      // TODO валидацию
      // is it admin
      try {
        const { error: errorPost } = await supabaseService
          .from('users')
          .update({
            blocked: blocked ? new Date().toISOString().toLocaleString('en-US') : null,
          })
          .match({ login })

        if (errorPost) throw errorPost
      } catch (error) {
        console.log(error)
        res.status(404).json({ error })
        return
      }
      res.status(201).json({})
      break
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
