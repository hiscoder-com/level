import '../styles/globals.css'
import Layout from '../components/layout'
import { UserContextProvider } from '../lib/UserContext'
import { supabase } from '../utils/supabaseClient'
import { appWithTranslation } from 'next-i18next'

function MyApp({ Component, pageProps }) {
  return (
    <UserContextProvider supabaseClient={supabase}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </UserContextProvider>
  )
}

export default appWithTranslation(MyApp)
