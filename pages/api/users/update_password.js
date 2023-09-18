import supabaseApi from 'utils/supabaseServer'

export default async function updatePasswordHandler(req, res) {
  let supabase
  try {
    supabase = await supabaseApi({ req, res })
  } catch (error) {
    return res.status(401).json({ error })
  }

  const {
    method,
    body: { password },
  } = req
  let data = ''
  switch (method) {
    case 'PUT':
      try {
        const { user, error } = await supabase.auth.updateUser({ password })
        data = user
        if (error) throw error
      } catch (error) {
        return res.status(404).json({ error })
      }
      res.status(200).json({ data })
      break
    default:
      res.setHeader('Allow', ['PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
