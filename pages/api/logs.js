import { supabaseService } from 'utils/supabaseServer'

export default async function notesHandler(req, res) {
  if (!req?.headers?.token) {
    return res.status(401).json({ error: 'Access denied!' })
  }

  const { body, method } = req
  switch (method) {
    case 'POST':
      try {
        const { data, error } = await supabaseService
          .from('logs')
          .insert({
            log: body,
          })
          .select()

        if (error) throw error
        return res.status(200).json(data)
      } catch (error) {
        return res.status(404).json({ error })
      }
      break
    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
