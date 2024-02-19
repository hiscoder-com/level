import Head from 'next/head'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import PasswordRecovery from 'components/PasswordRecovery'
import StartPage from 'components/StartPage/StartPage'

export default function PasswordRecoveryPage() {
  const { t } = useTranslation('common')
  return (
    <main className="flex flex-col justify-center font-sans min-h-screen bg-th-secondary-100">
      <Head>
        <title>{t('V-CANA')}</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <StartPage>
        <PasswordRecovery />
      </StartPage>
    </main>
  )
}

PasswordRecoveryPage.layoutType = 'empty'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'users'])),
    },
  }
}
