import Head from 'next/head'

import { useTranslation } from 'next-i18next'

import { useCurrentUser } from '../lib/UserContext'

export default function SignInPage() {
  const { user } = useCurrentUser()
  const { t } = useTranslation('users')

  return (
    <div className="container">
      <Head>
        <title>{t('V-CANASignIn')}</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {user ? JSON.stringify(user) : `${t('UserError')}`}
    </div>
  )
}
