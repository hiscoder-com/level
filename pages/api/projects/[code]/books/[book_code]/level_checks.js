import { supabaseService } from 'utils/supabaseService'
import supabaseApi from 'utils/supabaseServer'

const validation = (level_checks) => {
  const error = null
  if (!level_checks) {
    return { error: 'Level checks is null or undefined' }
  }

  try {
    const obj = JSON.parse(JSON.stringify(level_checks))
    if (!obj || typeof obj !== 'object') {
      throw new Error('This is incorrect json')
    }
  } catch (error) {
    return { error: 'This is incorrect json', properties }
  }

  if (
    JSON.stringify(Object.keys(level_checks)?.sort()) !==
    JSON.stringify(['url', 'level'].sort())
  ) {
    throw new Error('Level_checks has different keys')
  }

  return { error }
}

export default async function bookLevelChecksHandler(req, res) {
  let supabase
  try {
    supabase = await supabaseApi({ req, res })
  } catch (error) {
    return res.status(401).json({ error })
  }
  const {
    query: { book_code },
    body: { level_checks, project_id, user_id },
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

  const { error: validationError } = validation(level_checks)
  if (validationError) {
    return res.status(404).json({ validationError })
  }
  switch (method) {
    case 'PUT':
      try {
        const { error } = await supabaseService
          .from('books')
          .update([
            {
              level_checks,
            },
          ])
          .match({ code: book_code, project_id })
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
