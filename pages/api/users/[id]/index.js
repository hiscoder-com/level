import { supabase } from '@/utils/supabaseClient'
import { supabaseService } from '@/utils/supabaseServer'

export default async function userHandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)

  const {
    query: { id },
    body: { blocked },
    method,
  } = req

  switch (method) {
    case 'GET':
      let user
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, login, email, blocked, agreement, confession, is_admin')
          .eq('id', id)
          .single()
        if (error) throw error
        user = data
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      res.status(200).json(user)
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
          .match({ id })

        if (errorPost) throw errorPost
      } catch (error) {
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
