import { validationBrief } from 'utils/helper'
import { supabase } from 'utils/supabaseClient'

export default async function briefsGetHandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)
  const {
    query: { id },
    body: { data_collection },
    method,
  } = req

  switch (method) {
    case 'GET':
      try {
        const { data, error } = await supabase
          .from('briefs')
          .select('*')
          .eq('project_id', id)
          .maybeSingle()

        if (error) throw error
        res.status(200).json(data)
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      break
    case 'PUT':
      try {
        if (data_collection?.length > 1 && !validationBrief(data_collection)?.error) {
          const { data, error } = await supabase
            .from('briefs')
            .update({ data_collection })
            .match({ project_id: id })
          if (error) throw error
          res.status(200).json(data)
        } else {
          res.status(404).json({ error })
        }
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
