import { supabaseService } from 'utils/supabaseService'

export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'PUT':
      // TODO валидацию
      // is it admin
      const { id, text } = req.body
      try {
        const { error: errorPost } = await supabaseService.rpc('save_verses', {
          verses: { [id]: text },
        })
        if (errorPost) throw errorPost
        return res.status(201).json({})
      } catch (error) {
        return res.status(404).json(error)
      }
      break
    default:
      res.setHeader('Allow', ['PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
