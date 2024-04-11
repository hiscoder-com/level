import supabaseApi from 'utils/supabaseServer'

export default async function briefsGetHandler(req, res) {
  let supabase
  try {
    supabase = await supabaseApi({ req, res })
  } catch (error) {
    return res.status(401).json({ error })
  }
  const {
    query: { id },
    body: { name },
    method,
  } = req

  switch (method) {
    case 'PUT':
      try {
        if (name) {
          const { data, error } = await supabase
            .from('briefs')
            .update({ name })
            .match({ id })
            .select()
          if (error) throw error
          return res.status(200).json(data)
        } else {
          return res.status(404).json({ error: { message: 'Wrong name' } })
        }
      } catch (error) {
        return res.status(404).json({ error })
      }
    default:
      res.setHeader('Allow', ['PUT'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
