import Head from 'next/head'

import { useTranslation } from 'next-i18next'

import SignUp from 'components/SignUp'

export default function SignUpPage() {
  const { t } = useTranslation('users')

  return (
    <div className="container">
      <Head>
        <title>{t('V-CANASignUp')}</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SignUp />
    </div>
  )
}
