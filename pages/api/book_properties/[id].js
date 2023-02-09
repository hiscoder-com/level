import { supabaseService } from 'utils/supabaseServer'

const validation = (properties) => {
  const error = null
  if (!properties) {
    return { error: 'Properties is null or undefined' }
  }

  try {
    const obj = JSON.parse(JSON.stringify(properties))
    if (!obj || typeof obj !== 'object') {
      return { error: 'This is incorrect json', properties }
    }
  } catch (e) {
    return { error: 'This is incorrect json', properties }
  }

  if (
    JSON.stringify(Object.keys(properties)?.sort()) !==
    JSON.stringify(['obs', 'scripture'].sort())
  ) {
    return { error: 'Properties has different keys', properties }
  }

  if (
    JSON.stringify(Object.keys(properties.obs)?.sort()) !==
    JSON.stringify(['title', 'intro', 'back', 'chapter_label'].sort())
  ) {
    return { error: 'Properties has different keys in OBS part', properties }
  }

  if (
    JSON.stringify(Object.keys(properties.scripture)?.sort()) !==
    JSON.stringify(['h', 'toc1', 'toc2', 'toc3', 'mt', 'chapter_label'].sort())
  ) {
    return {
      error: 'Properties has different keys in Scripture part',
      properties,
    }
  }
  return { error }
}

export default async function bookPropertiesHandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }

  const {
    query: { id },
    body: { properties, project_id },
    method,
  } = req
  const { error: validationError } = validation(properties)
  if (validationError) {
    res.status(404).json({ validationError })
    return
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
          .match({ id, project_id })
        if (error) throw error
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      res.status(200).json({ success: true })

      break

    default:
      res.setHeader('Allow', ['PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
