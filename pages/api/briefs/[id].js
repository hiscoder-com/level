import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

export default async function briefsGetHandler(req, res) {
  if (!req?.headers?.token) {
    return res.status(401).json({ error: 'Access denied!' })
  }
  const supabase = createPagesServerClient({ req, res })
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
      const isValidKeys = brief_data.find((briefObj) => {
        const isNotValid =
          JSON.stringify(Object.keys(briefObj).sort()) !==
          JSON.stringify(['block', 'id', 'resume', 'title'].sort())
        if (isNotValid) {
          return isNotValid
        } else {
          briefObj.block?.forEach((blockObj) => {
            if (
              JSON.stringify(Object.keys(blockObj).sort()) !==
              JSON.stringify(['question', 'answer'].sort())
            ) {
              return { error: 'brief_data.block has different keys', blockObj }
            }
          })
        }
      })
      if (isValidKeys) {
        return { error: 'brief_data has different keys', isValidKeys }
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
        return res.status(200).json(data)
      } catch (error) {
        return res.status(404).json({ error })
      }
    case 'PUT':
      try {
        if (data_collection?.length > 1 && !validation(data_collection)?.error) {
          const { data, error } = await supabase
            .from('briefs')
            .update({ data_collection })
            .match({ project_id: id })
            .select()
          if (error) throw error
          return res.status(200).json(data)
        } else {
          return res.status(404).json({ error })
        }
      } catch (error) {
        return res.status(404).json({ error })
      }
    default:
      res.setHeader('Allow', ['GET', 'PUT'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
