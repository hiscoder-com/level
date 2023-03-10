import Head from 'next/head'
import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Projects from 'components/Projects'

export default function LanguagesPage() {
  const router = useRouter()
  const { lang } = router.query
  const { t } = useTranslation(['projects', 'common'])

  return (
    <div className="px-5 mx-auto pb-16 lg:max-w-7xl">
      <Head>
        <title>{t('V-CANALanguages')}</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        <div className="my-10">
          <Projects languageCode={lang} />
        </div>
      </div>
    </div>
  )
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['projects', 'common', 'books','users'])),
    },
  }
}
