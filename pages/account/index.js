import { useEffect } from 'react'

import Head from 'next/head'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Account from 'components/Account'

function AccountHomePage() {
  const { t } = useTranslation(['users', 'common'])
  useEffect(() => {
    document.body.classList.add('no-scrollbar')

    return () => {
      document.body.classList.remove('no-scrollbar')
    }
  }, [])
  return (
    <>
      <Head>
        <title>{t('V-CANAAccount')}</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Account />
    </>
  )
}

export default AccountHomePage

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        'users',
        'common',
        'books',
        'projects',
        'project-edit',
      ])),
    },
  }
}
