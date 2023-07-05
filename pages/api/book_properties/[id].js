import { supabaseService } from 'utils/supabaseServer'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

const validation = (properties) => {
  const error = null
  if (!properties) {
    return { error: 'Properties is null or undefined' }
  }

  try {
    const obj = JSON.parse(JSON.stringify(properties))
    if (!obj || typeof obj !== 'object') {
      throw new Error('This is incorrect json')
    }
  } catch (error) {
    return { error: 'This is incorrect json', properties }
  }

  if (
    JSON.stringify(Object.keys(properties)?.sort()) !==
    JSON.stringify(['obs', 'scripture'].sort())
  ) {
    throw new Error('Properties has different keys')
  }

  if (
    JSON.stringify(Object.keys(properties.obs)?.sort()) !==
    JSON.stringify(['title', 'intro', 'back', 'chapter_label'].sort())
  ) {
    throw new Error('Properties has different keys in OBS part')
  }

  if (
    JSON.stringify(Object.keys(properties.scripture)?.sort()) !==
    JSON.stringify(['h', 'toc1', 'toc2', 'toc3', 'mt', 'chapter_label'].sort())
  ) {
    throw new Error('Properties has different keys in Scripture part')
  }
  return { error }
}

export default async function bookPropertiesHandler(req, res) {
  const supabase = createPagesServerClient({ req, res })

  if (!req?.headers?.token) {
    return res.status(401).json({ error: 'Access denied!' })
  }

  const {
    query: { id },
    body: { properties, project_id, user_id },
    method,
  } = req

  if (!project_id || !user_id) {
    return res.status(401).json({ error: 'Access denied!' })
  }
  try {
    const level = await supabase.rpc('authorize', {
      user_id,
      project_id,
    })

    if (!['admin', 'coordinator'].includes(level.data)) {
      return res.status(401).json({ error: 'Access denied!' })
    }
  } catch (error) {
    return res.status(404).json({ error })
  }

  const { error: validationError } = validation(properties)
  if (validationError) {
    return res.status(404).json({ validationError })
  }
  switch (method) {
    case 'PUT':
      try {
        const { data, error } = await supabaseService
          .from('books')
          .update([
            {
              properties,
            },
          ])
          .select()
          .match({ id, project_id })
        if (error) throw error
      } catch (error) {
        return res.status(404).json({ error })
      }
      return res.status(200).json({ success: true })

    default:
      res.setHeader('Allow', ['PUT'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
