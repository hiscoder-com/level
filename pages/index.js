import Head from 'next/head'
import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import StartPage from 'components/StartPage/StartPage'

export default function Home() {
  const { t } = useTranslation('common')
  const { query } = useRouter()
  return (
    <main className="flex flex-col justify-center font-sans min-h-screen bg-th-secondary-100">
      <Head>
        <title>{t('V-CANA')}</title>
        <meta name="description" content={t('MainBlocks.VcanaText')} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <StartPage defaultContentKey={query?.contentKey || null} />
    </main>
  )
}

Home.layoutType = 'empty'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        'start-page',
        'common',
        'users',
        'projects',
      ])),
    },
  }
}
