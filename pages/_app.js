import { appWithTranslation } from 'next-i18next'
import localFont from 'next/font/local'
import { RecoilRoot } from 'recoil'

import Layout from 'components/Layout'

import { UserContextProvider } from 'lib/UserContext'

import 'styles/globals.css'

import useSupabaseClient from 'utils/supabaseClient'
import { useGetTheme } from 'utils/hooks'

const roboto = localFont({ src: './RobotoFlex.ttf', variable: '--font-roboto' })

function MyApp({ Component, pageProps }) {
  const supabaseClient = useSupabaseClient()
  useGetTheme()
  if (Component.layoutType == 'empty') {
    return (
      <UserContextProvider supabaseClient={supabaseClient}>
        <RecoilRoot>
          <main className={`${roboto.variable} font-sans`}>
            <Component {...pageProps} />
          </main>
        </RecoilRoot>
      </UserContextProvider>
    )
  }

  return (
    <UserContextProvider supabaseClient={supabaseClient}>
      <RecoilRoot>
        <main className={`${roboto.variable} font-sans`}>
          <Layout backgroundColor={Component.backgroundColor ?? 'bg-th-secondary-100'}>
            <Component {...pageProps} />
          </Layout>
        </main>
      </RecoilRoot>
    </UserContextProvider>
  )
}

export default appWithTranslation(MyApp)
