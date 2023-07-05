import { appWithTranslation } from 'next-i18next'

import { RecoilRoot } from 'recoil'

import Layout from 'components/Layout'

import { UserContextProvider } from 'lib/UserContext'

import 'styles/globals.css'

import useSupabaseClient from 'utils/supabaseClient'

function MyApp({ Component, pageProps }) {
  const supabaseClient = useSupabaseClient()
  if (Component.layoutType == 'empty') {
    return (
      <UserContextProvider supabaseClient={supabaseClient}>
        <RecoilRoot>
          <Component {...pageProps} />
        </RecoilRoot>
      </UserContextProvider>
    )
  }

  return (
    <UserContextProvider supabaseClient={supabaseClient}>
      <RecoilRoot>
        <Layout backgroundColor={Component.backgroundColor ?? 'bg-blue-150'}>
          <Component {...pageProps} />
        </Layout>
      </RecoilRoot>
    </UserContextProvider>
  )
}

export default appWithTranslation(MyApp)
