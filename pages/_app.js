import '../styles/globals.css'
import Layout from '../components/layout'
import { supabase } from '../utils/supabaseClient'
import { useEffect } from 'react'

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event == 'SIGNED_IN') console.log('SIGNED_IN', session)
      if (_event == 'SIGNED_OUT') console.log('SIGNED_OUT', session)
      if (_event == 'TOKEN_REFRESHED') console.log('TOKEN_REFRESHED', session)
      // setSession(session)
    })
    return () => {
      authListener.unsubscribe()
    }
  }, [])
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}

export default MyApp
