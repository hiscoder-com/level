import { supabase } from '../../utils/initSupabase'

// как делать запросы на стороне сервера (т.е. api запросы)
// Мы используем SWR, и передаем в header наш token.
// А его уже используем для запросов к supabase
/**
  const fetcher = (url, token) =>
  fetch(url, {
    method: 'GET',
    headers: new Headers({ 'Content-Type': 'application/json', token }),
    credentials: 'same-origin',
  }).then((res) => res.json())

const Index = () => {
  const { user, session } = useUser()
  const { data, error } = useSWR(session ? ['/api/getUser', session.access_token] : null, fetcher)
 */
const getUser = async (req, res) => {
  const token = req.headers.token

  const { data: user, error } = await supabase.auth.api.getUser(token)

  if (error) return res.status(401).json({ error: error.message })
  return res.status(200).json(user)
}

export default getUser
