import Head from 'next/head'
import { useRouter } from 'next/router'

import Projects from '../../components/Projects'

export default function LanguagesPage() {
  const router = useRouter()
  const { lang } = router.query

  return (
    <div className="px-5 mx-auto pb-16 lg:max-w-7xl">
      <Head>
        <title>V-CANA languages</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        <div className="my-10">
          <Projects languageCode={lang} />
        </div>
        <div>
          <div className="text-3xl leading-9 font-medium mb-5">Мой прогресс:</div>
          <div>прогресс...</div>
        </div>
      </div>
    </div>
  )
}
