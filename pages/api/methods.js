import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

export default async function methodsHandler(req, res) {
  if (!req?.headers?.token) {
    return res.status(401).json({ error: 'Access denied!' })
  }
  const supabase = createPagesServerClient({ req, res })

  const { method } = req
  let data = {}
  switch (method) {
    case 'GET':
      try {
        const { data: value, error } = await supabase.from('methods').select('*')
        if (error) throw error
        data = value
      } catch (error) {
        return res.status(404).json({ error })
      }
      return res.status(200).json(data)
    default:
      res.setHeader('Allow', ['GET'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
