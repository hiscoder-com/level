import { supabaseService } from 'utils/supabaseService'

export default async function notesHandler(req, res) {
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
