import { supabaseService } from 'utils/supabaseServer'

export default async function info(req, res) {
  const { method } = req

  switch (method) {
    case 'GET':
      try {
        const { data: methods, error } = await supabaseService
          .from('methods')
          .select('id, steps')
          .eq('type', 'bible')

        if (error) throw error

        for (const method of methods) {
          for (const [index, step] of method.steps.entries()) {
            const info = {
              name: 'info',
              config: { url: 'https://git.door43.org/ru_gl/ru_tn' },
            }

            if (step.config[0].tools.filter((tool) => tool.name === 'info').length > 0) {
              continue
            }

            if (index === 0 || index === 1) {
              step.config[0].tools.unshift(info)
            } else {
              step.config[0].tools.push(info)
            }
          }

          const { error: errorUpdate } = await supabaseService
            .from('methods')
            .update({ steps: method.steps })
            .match({ id: method.id })
          if (errorUpdate) throw errorUpdate
        }

        return res.status(200).json({ methods })
      } catch (error) {
        return res.status(404).json({ error })
      }

    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
