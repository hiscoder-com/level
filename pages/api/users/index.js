import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import { supabaseService } from 'utils/supabaseServer'

export default async function handler(req, res) {
  if (!req?.headers?.token) {
    return res.status(401).json({ error: 'Access denied!' })
  }
  const supabase = createPagesServerClient({ req, res })
  const { method } = req
  switch (method) {
    case 'GET':
      try {
        const { data: users, error: errorGet } = await supabase
          .from('users')
          .select('id, login, email, blocked, agreement, confession, is_admin')
          .order('login', { ascending: true })
        if (errorGet) throw errorGet
        return res.status(200).json(users)
      } catch (error) {
        return res.status(404).json(error)
      }
    case 'POST':
      switch (process.env.CREATE_USERS ?? 'none') {
        case 'all':
          // validation disabled
          break
        case 'admin':
          try {
            const { data: users, error: errorUser } = await supabaseService
              .from('users')
              .select('id')
              .limit(1)
            if (errorUser) throw errorUser
            if (users?.length === 1) {
              const { data: is_admin, error: error_rpc } = await supabase.rpc(
                'admin_only'
              )
              if (error_rpc) throw error_rpc
              if (!is_admin) {
                return res.status(404).json({ error: 'Access denied!' })
              }
            }
          } catch (error) {
            return res.status(404).json(error)
          }
          break

        case 'none':
        default:
          return res.status(404).json({ error: 'Access denied!' })
      }
      const { email, password, login } = req.body
      try {
        const { error: errorPost } = await supabaseService.auth.api.createUser({
          email,
          password,
          user_metadata: { login },
          email_confirm: true,
        })
        if (errorPost) throw errorPost

        const { data: users, error: errorUser } = await supabaseService
          .from('users')
          .select('id')
          .limit(2)
        if (errorUser) throw errorUser

        if (users?.length === 1) {
          const { error: errorUpdate } = await supabaseService
            .from('users')
            .update({ is_admin: true })
            .eq('id', users[0].id)
          if (errorUpdate) throw errorUpdate
        }
        return res.status(201).json({})
      } catch (error) {
        return res.status(404).json(error)
      }
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
