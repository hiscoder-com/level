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

  const validation = (brief_data) => {
    if (!brief_data) {
      return { error: 'Properties is null or undefined' }
    }
    if (Array.isArray(brief_data)) {
      const isValidKeys = brief_data.find((item) => {
        const isNotValid =
          JSON.stringify(Object.keys(item).sort()) !==
          JSON.stringify(['block', 'id', 'resume', 'title'].sort())
        if (isNotValid) {
          return isNotValid
        } else {
          item.block?.forEach((element) => {
            if (
              JSON.stringify(Object.keys(element).sort()) !==
              JSON.stringify(['question', 'answer'].sort())
            ) {
              return { error: 'test error!' } //
            }
          })
        }
      })
      if (isValidKeys) {
        return { error: 'Properties has different keys', isValidKeys }
      }
    }

    return { error: null }
  }

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
        if (data_collection?.length > 1 && !validation(data_collection)?.error) {
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
