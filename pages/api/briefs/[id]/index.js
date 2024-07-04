import supabaseApi from 'utils/supabaseServer'
import { validationBrief } from 'utils/helper'

export default async function briefsGetHandler(req, res) {
  let supabase
  try {
    supabase = await supabaseApi({ req, res })
  } catch (error) {
    return res.status(401).json({ error })
  }
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
        return res.status(200).json(data)
      } catch (error) {
        return res.status(404).json({ error })
      }
    case 'PUT':
      try {
        if (data_collection?.length > 0 && !validationBrief(data_collection)?.error) {
          const { data, error } = await supabase
            .from('briefs')
            .update({ data_collection })
            .match({ project_id: id })
            .select()
          if (error) throw error
          return res.status(200).json(data)
        } else {
          return res.status(404).json({ error: { message: 'Wrong brief structure' } })
        }
      } catch (error) {
        return res.status(404).json({ error })
      }
    default:
      res.setHeader('Allow', ['GET', 'PUT'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
