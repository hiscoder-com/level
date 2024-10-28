import Head from 'next/head'
import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import StartPage from 'components/StartPage/StartPage'
import { openGraph } from '../utils/openGraph'

export default function Home() {
  const { t } = useTranslation('common')
  const { query } = useRouter()
  return (
    <main className="flex flex-col justify-center font-sans min-h-screen bg-th-secondary-100">
      <Head>
        <title>{t('LEVEL')}</title>
        <meta name="description" content={t('MainBlocks.LevelText')} />
        <link rel="icon" href="/favicon.ico" />

        <meta property="og:title" content={openGraph.title || t('LEVEL')} />
        <meta
          property="og:description"
          content={openGraph.description || t('MainBlocks.LevelText')}
        />
        <meta property="og:site_name" content={openGraph.siteName} />
        <meta property="og:type" content={openGraph.type} />
        <meta property="og:image" content={openGraph.images[0]?.url || '/social.webp'} />
        <meta property="og:image:width" content={openGraph.images[0]?.width.toString()} />
        <meta
          property="og:image:height"
          content={openGraph.images[0]?.height.toString()}
        />
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
