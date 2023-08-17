import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import { stepValidation } from 'utils/helper'

export default async function stepsHandler(req, res) {
  const supabase = createPagesServerClient({ req, res })

  const {
    query: { id },
    body: { step },
    method,
  } = req

  switch (method) {
    case 'PUT':
      try {
        const { error } = stepValidation({ ...step, id })
        if (error) throw error
        const { error: stepError } = await supabase
          .from('steps')
          .update({ ...step })
          .match({ id })
        if (stepError) throw stepError
      } catch (error) {
        return res.status(404).json({ error })
      }
      return res.status(200).json({ success: true })

    default:
      res.setHeader('Allow', ['PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
