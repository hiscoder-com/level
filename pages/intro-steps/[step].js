import Head from 'next/head'
import { useRouter } from 'next/router'

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
      <div>intro:{step}</div>
    </div>
  )
}
