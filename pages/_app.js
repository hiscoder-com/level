import { appWithTranslation } from 'next-i18next'
import { RecoilRoot } from 'recoil'

import Layout from 'components/Layout'

import { UserContextProvider } from 'lib/UserContext'

import 'styles/globals.css'

import useSupabaseClient from 'utils/supabaseClient'
import { useGetTheme } from 'utils/hooks'

import { roboto } from 'public/fonts/fonts'

function MyApp({ Component, pageProps }) {
  const isIntranet = process.env.NEXT_PUBLIC_INTRANET ?? false
  const supabaseClient = useSupabaseClient()
  useGetTheme()
  if (Component.layoutType == 'empty') {
    return (
      <UserContextProvider supabaseClient={supabaseClient}>
        <RecoilRoot>
          <main className={isIntranet ? roboto.className : ''}>
            <Component {...pageProps} />
          </main>
        </RecoilRoot>
      </UserContextProvider>
    )
  }

  return (
    <UserContextProvider supabaseClient={supabaseClient}>
      <RecoilRoot>
        <main className={isIntranet ? roboto.className : ''}>
          <Layout backgroundColor={Component.backgroundColor ?? 'bg-th-secondary-100'}>
            <Component {...pageProps} />
          </Layout>
        </main>
      </RecoilRoot>
    </UserContextProvider>
  )
}

export default appWithTranslation(MyApp)
