/**
 * Это надо для SSR (getServerSideProps)!
 *
 * Вот так устанавливаем куку
 * fetch('/api/auth', {
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        credentials: 'same-origin',
        body: JSON.stringify({ event, session }),
      }).then((res) => res.json())

      Вот так делаем запрос

export async function getServerSideProps({ req }) {
  const { user } = await supabase.auth.api.getUserByCookie(req)

  if (!user) {
    // If no user, redirect to index.
    return { props: {}, redirect: { destination: '/', permanent: false } }
  }

  // If there is a user, return it.
  return { props: { user } }
}
 */
import { supabase } from '../../utils/supabaseClient'

export default function handler(req, res) {
  supabase.auth.api.setAuthCookie(req, res)
}
