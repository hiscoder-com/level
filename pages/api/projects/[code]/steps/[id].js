import { supabaseService } from 'utils/supabaseServer'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

export default async function stepsHandler(req, res) {
  if (!req.headers.token) {
    return res.status(401).json({ error: 'Access denied!' })
  }
  const supabase = createPagesServerClient({ req, res })

  let data = {}
  const {
    query: { code, id },
    body: { updatedPartStep },
    method,
  } = req

  console.log(updatedPartStep)
  // const { error: validationError } = validation(properties)
  // if (validationError) {
  //   res.status(404).json({ validationError })
  //   return
  // }
  switch (method) {
    case 'PUT':
      try {
        const { data, error } = await supabaseService
          .from('steps')
          .update({ ...updatedPartStep })
          .match({ id })
        if (error) throw error
      } catch (error) {
        return res.status(404).json({ error })
      }
      return res.status(200).json({ success: true })

    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
