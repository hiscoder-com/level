import Head from 'next/head'

import Account from 'components/Account'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

function AccountHomePage() {
  const { t } = useTranslation(['users'])

  return (
    <div className="container">
      <Head>
        <title>{t('V-CANAAccount')}</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Account />
    </div>
  )
}

export default AccountHomePage

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['users', 'common'])),
      // Will be passed to the page component as props
    },
  }
}
