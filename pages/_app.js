import { UserContextProvider } from 'lib/UserContext'
import { appWithTranslation } from 'next-i18next'
import { RecoilRoot } from 'recoil'

import Layout from 'components/Layout'

import 'styles/globals.css'

import { roboto } from 'public/fonts/fonts'

import { useGetTheme } from 'utils/hooks'
import useSupabaseClient from 'utils/supabaseClient'

function MyApp({ Component, pageProps }) {
  const isIntranet = process.env.NEXT_PUBLIC_INTRANET ?? false
  const supabaseClient = useSupabaseClient()
  useGetTheme()
  const renderContent = () => {
    if (Component.layoutType === 'empty') {
      return <Component {...pageProps} />
    }

    const layoutProps = {
      backgroundColor: Component.backgroundColor ?? 'bg-th-secondary-100',
    }

    return (
      <Layout {...layoutProps}>
        <Component {...pageProps} />
      </Layout>
    )
  }

  return (
    <UserContextProvider supabaseClient={supabaseClient}>
      <RecoilRoot>
        <main className={isIntranet ? roboto.className : ''}>{renderContent()}</main>
      </RecoilRoot>
    </UserContextProvider>
  )
}

export default appWithTranslation(MyApp)
