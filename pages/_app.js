import { appWithTranslation } from 'next-i18next'

import { RecoilRoot } from 'recoil'

import Layout from 'components/Layout'

import { UserContextProvider } from 'lib/UserContext'
import { supabase } from 'utils/supabaseClient'

import 'styles/globals.css'

function MyApp({ Component, pageProps }) {
  if (Component.layoutType == 'empty') {
    return (
      <UserContextProvider supabaseClient={supabase}>
        <RecoilRoot>
          <Component {...pageProps} />
        </RecoilRoot>
      </UserContextProvider>
    )
  }

  return (
    <UserContextProvider supabaseClient={supabase}>
      <RecoilRoot>
        <Layout backgroundColor={Component.backgroundColor ?? 'bg-blue-150'}>
          <Component {...pageProps} />
        </Layout>
      </RecoilRoot>
    </UserContextProvider>
  )
}

export default appWithTranslation(MyApp)
