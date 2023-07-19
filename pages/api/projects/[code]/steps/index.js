import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

const stepValidation = (steps) => {
  // TODO доделать валидацию
  const error = null
  if (!steps?.length) {
    return { error: 'This is incorrect json', steps }
  }
  for (const step of steps) {
    try {
      const obj = JSON.parse(JSON.stringify(step))
      if (!obj || typeof obj !== 'object') {
        throw new Error('This is incorrect json')
      }
      if (
        JSON.stringify(Object.keys(step)?.sort()) !==
        JSON.stringify(['intro', 'description', 'title'].sort())
      ) {
        throw new Error('step has different keys')
      }
    } catch (error) {
      return error
    }
  }

  return { error }
}

export default async function stepsHandler(req, res) {
  if (!req.headers.token) {
    return res.status(401).json({ error: 'Access denied!' })
  }
  const supabase = createPagesServerClient({ req, res })

  let data = {}
  const {
    query: { code },
    body,
    method,
  } = req

  switch (method) {
    case 'GET':
      try {
        const { data: value, error } = await supabase
          .from('steps')
          .select(
            'id, projects!inner(code), description, intro, title, count_of_users, time, config'
          )
          .eq('projects.code', code)
          .order('sorting', { ascending: true })
        if (error) throw error
        data = value
      } catch (error) {
        return res.status(404).json({ error })
      }
      return res.status(200).json(data)
    case 'PUT':
      const { project_id, _steps } = body
      // const error = stepValidation(_steps)
      if (error) throw error
      try {
        const { error } = await supabase.rpc('update_multiple_steps', {
          steps: _steps,
          project_id,
        })
        if (error) throw error
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      res.status(200).json({ success: true })

      break

    default:
      res.setHeader('Allow', ['GET', 'PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
