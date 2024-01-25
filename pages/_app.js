import { appWithTranslation } from 'next-i18next'

import { RecoilRoot } from 'recoil'

import Layout from 'components/Layout'

import { UserContextProvider } from 'lib/UserContext'

import 'styles/globals.css'

import useSupabaseClient from 'utils/supabaseClient'
import { useGetTheme } from 'utils/hooks'

function MyApp({ Component, pageProps }) {
  const supabaseClient = useSupabaseClient()
  useGetTheme()
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
        <Layout backgroundColor={Component.backgroundColor ?? 'bg-th-secondary-100'}>
          <Component {...pageProps} />
        </Layout>
      </RecoilRoot>
    </UserContextProvider>
  )
}

export default appWithTranslation(MyApp)
