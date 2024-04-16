import supabaseApi from 'utils/supabaseServer'
import { stepsValidation } from 'utils/helper'

export default async function stepsHandler(req, res) {
  let supabase
  try {
    supabase = await supabaseApi({ req, res })
  } catch (error) {
    return res.status(401).json({ error })
  }

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
            'id, projects!inner(code), description, intro, title, subtitle, count_of_users, time, config, is_awaiting_team'
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
      const { error } = stepsValidation(_steps)
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
