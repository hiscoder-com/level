import Head from 'next/head'
import { useRouter } from 'next/router'

export default function StepPage() {
  const router = useRouter()
  const { step } = router.query
  return (
    <div className="container">
      <Head>
        <title>V-CANA Step {step}</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>Step:{step}</div>
    </div>
  )
}
