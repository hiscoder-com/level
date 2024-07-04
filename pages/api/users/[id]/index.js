import supabaseApi from 'utils/supabaseServer'
import { supabaseService } from 'utils/supabaseService'

export default async function userHandler(req, res) {
  let supabase
  try {
    supabase = await supabaseApi({ req, res })
  } catch (error) {
    return res.status(401).json({ error })
  }
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
          .select(
            'id, login, email, blocked, agreement, confession, is_admin, avatar_url'
          )
          .eq('id', id)
          .single()
        if (error) throw error
        user = data
      } catch (error) {
        return res.status(404).json({ error })
      }
      return res.status(200).json(user)

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
        return res.status(404).json({ error })
      }
      return res.status(201).json({})

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
