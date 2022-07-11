import Head from 'next/head'
import { useRouter } from 'next/router'

import Projects from '../../components/Projects'

export default function LanguagesEditPage() {
  const router = useRouter()
  const { lang } = router.query
  return (
    <div className="container">
      <Head>
        <title>V-CANA Sign up</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Projects languageCode={lang} />
    </div>
  )
}
