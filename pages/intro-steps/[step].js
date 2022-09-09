import Head from 'next/head'
import { useRouter } from 'next/router'

import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'

import IntroStep from 'components/IntroStep'

export default function IntroPage() {
  const { query } = useRouter()
  const { step } = query
  const { t } = useTranslation(['intro-steps'])

  return (
    <div className="layout-appbar">
      <Head>
        <title>
          {t('V-CANAIntro')} {step}
        </title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <IntroStep step={step} />
    </div>
  )
}

export async function getServerSideProps({ locale, params }) {
  if (params.step > 7 || params.step <= 0) {
    return { notFound: true }
  }
  return {
    props: {
      ...(await serverSideTranslations(locale, ['intro-steps', 'common'])),
    },
  }
}
