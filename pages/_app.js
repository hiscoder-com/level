import { useContext, useState } from 'react'
import { appWithTranslation } from 'next-i18next'

import Layout from '../components/Layout'

import { supabase } from '../utils/supabaseClient'
import { UserContextProvider } from '../lib/UserContext'
import { AppContextProvider } from '../lib/AppContext'

import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  if (Component.layoutType == 'empty') {
    return (
      <UserContextProvider supabaseClient={supabase}>
        <AppContextProvider>
          <Component {...pageProps} />
        </AppContextProvider>
      </UserContextProvider>
    )
  }
  return (
    <UserContextProvider supabaseClient={supabase}>
      <AppContextProvider>
        <Layout backgroundColor={Component.backgroundColor ?? 'bg-[#DCE4E9]'}>
          <Component {...pageProps} />
        </Layout>
      </AppContextProvider>
    </UserContextProvider>
  )
}

export default appWithTranslation(MyApp)
