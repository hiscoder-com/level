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
  const renderContent = () => {
    if (Component.layoutType === 'empty') {
      return <Component {...pageProps} />
    }

    const layoutProps = {
      backgroundColor: Component.backgroundColor ?? 'bg-th-secondary-100',
      isHideSidebar: Component.layoutType === 'hideSidebar',
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
