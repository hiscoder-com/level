import Head from 'next/head'
import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import StartPage from 'components/StartPage/StartPage'

export default function Home() {
  const { t } = useTranslation('common')
  const { query } = useRouter()
  return (
    <main className="flex min-h-screen flex-col justify-center bg-th-secondary-100 font-sans">
      <Head>
        <title>{t('LEVEL')}</title>
        <meta name="description" content={t('MainBlocks.LevelText')} />
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
