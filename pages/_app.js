import { appWithTranslation } from 'next-i18next'

import Layout from '../components/Layout'

import { supabase } from '../utils/supabaseClient'
import { UserContextProvider } from '../lib/UserContext'

import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  if (Component.layoutType == 'empty') {
    return (
      <UserContextProvider supabaseClient={supabase}>
        <Component {...pageProps} />
      </UserContextProvider>
    )
  }
  return (
    <UserContextProvider supabaseClient={supabase}>
      <Layout backgroundColor={Component.backgroundColor ?? 'bg-[#DCE4E9]'}>
        <Component {...pageProps} />
      </Layout>
    </UserContextProvider>
  )
}

export default appWithTranslation(MyApp)
