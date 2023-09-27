import { supabaseService } from 'utils/supabaseService'

export default async function sendRecoveryHandler(req, res) {
  const {
    method,
    body: { email, url },
  } = req
  let data = ''
  switch (method) {
    case 'POST':
      try {
        const { data: dataSend, error } =
          await supabaseService.auth.resetPasswordForEmail(
            email
            //   , {
            //   redirectTo: `${url}/password-recovery`,
            // }
          )
        data = dataSend
        if (error) throw error
      } catch (error) {
        if (error.status) {
          return res.status(error.status).json({ error })
        } else {
          return res.status(404).json({ error })
        }
      }
      res.status(200).json({ data })
      break
    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
