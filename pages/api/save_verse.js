import { supabase } from 'utils/supabaseClient'
import { supabaseService } from 'utils/supabaseServer'

export default async function handler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
    return
  }
  supabase.auth.setAuth(req.headers.token)

  const { method } = req

  switch (method) {
    case 'PUT':
      // TODO валидацию
      // is it admin
      const { id, text } = req.body
      //
      try {
        const { error: errorPost } = await supabaseService.rpc('save_verse', {
          verse_id: id,
          new_verse: text,
        })
        if (errorPost) throw errorPost
        res.status(201).json({})
      } catch (error) {
        res.status(404).json(error)
        return
      }
      break
    default:
      res.setHeader('Allow', ['PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
