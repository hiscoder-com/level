import supabaseApi from 'utils/supabaseServer'

export default async function saveTokenHandler(req, res) {
  let supabase

  try {
    supabase = await supabaseApi({ req, res })
  } catch (error) {
    return res.status(401).json({ error })
  }
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const { data: user, error } = await supabase
    .from('users')
    .select('comcheck_token')
    .eq('id', session.user.id)
    .single()
  if (error) throw error
  const { method } = req

  switch (method) {
    case 'GET':
      try {
        const response = await axios.get(
          'https://develop--community-check.netlify.app/',
          {
            headers: { 'x-comcheck-token': user.comcheck_token },
            accept: 'application/json',
          }
        )

        return res.status(200).json(response.data)
      } catch (error) {
        return res.status(404).json({ error })
      }
    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
