import Head from 'next/head'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Account from 'components/Account'

function AccountHomePage() {
  const { t } = useTranslation(['users', 'common'])

  return (
    <div className="container">
      <Head>
        <title>{t('V-CANAAccount')}</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="h1">{t('common:Account')}</h1>
      <Account />
    </div>
  )
}

export default AccountHomePage

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['users', 'common', 'books', 'projects'])),
    },
  }
}
