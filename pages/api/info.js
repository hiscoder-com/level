import { supabaseService } from 'utils/supabaseServer'

export default async function info(req, res) {
  const { method } = req

  switch (method) {
    case 'GET':
      try {
        const { data: steps, error } = await supabaseService
          .from('steps')
          .select('id, project_id, config, sorting, projects(resources)')
        if (error) throw error

        const host = process.env.NEXT_PUBLIC_NODE_HOST ?? 'https://git.door43.org'

        for (const step of steps) {
          if (!step.projects.resources?.tnotes) {
            continue
          }

          let tnotesIndex = -1
          step.config.forEach((config, index) => {
            if (config.tools.filter((tool) => tool.name === 'tnotes').length > 0) {
              tnotesIndex = index
            }
          })
          if (tnotesIndex === -1) {
            continue
          }

          if (step.config[0].tools.filter((tool) => tool.name === 'info').length > 0) {
            continue
          }

          const { owner, repo } = step.projects.resources.tnotes

          const url = host + '/' + owner + '/' + repo

          const info = { name: 'info', config: { repo: url } }

          if ([1, 2].includes(step.sorting)) {
            step.config[0].tools.unshift(info)
          } else {
            step.config[0].tools.push(info)
          }

          const { error: errorUpdate } = await supabaseService
            .from('steps')
            .update({ config: step.config })
            .match({ id: step.id })
          if (errorUpdate) throw errorUpdate
        }

        return res.status(200).json({ steps })
      } catch (error) {
        return res.status(404).json({ error })
      }

    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
