import Head from 'next/head'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import IntroStep from '../../components/IntroStep'

export default function IntroPage() {
  const router = useRouter()
  const { step } = router.query

  return (
    <div className="container">
      <Head>
        <title>V-CANA Intro {step}</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <IntroStep step={step} />
    </div>
  )
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['intro-steps', 'common'])),
      // Will be passed to the page component as props
    },
  }
}
