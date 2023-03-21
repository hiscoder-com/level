import { supabaseService } from 'utils/supabaseServer'

export default async function notesHandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }

  const { body, method } = req
  switch (method) {
    case 'POST':
      try {
        const { data, error } = await supabaseService.from('logs').insert({
          log: body,
        })

        if (error) throw error
        res.status(200).json(data)
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      break
    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
