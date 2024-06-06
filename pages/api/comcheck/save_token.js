import supabaseApi from 'utils/supabaseServer'

export default async function saveTokenHandler(req, res) {
  let supabase
  try {
    supabase = await supabaseApi({ req, res })
  } catch (error) {
    return res.status(401).json({ error })
  }
  const {
    body: { token, project_id },
    method,
  } = req
  switch (method) {
    case 'POST':
      try {
        const { data, error } = await supabase.rpc('save_token', {
          project_id,
          token,
        })

        if (error) throw error
        return res.status(200).json(data)
      } catch (error) {
        return res.status(404).json({ error })
      }

    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
