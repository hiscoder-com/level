import StartPage from 'components/StartPage/StartPage'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'

const SlugPage = () => {
  const router = useRouter()
  const { slug } = router.query
  const { t } = useTranslation(['start-page', 'projects', 'users', 'common'])

  const contentKeyMap = {
    'what-is-level': 'intro',
    reviews: 'reviews',
    faq: 'faq',
    partners: 'partners',
    'connect-with-us': 'connect',
    'how-it-works': 'howItWork',
    download: 'download',
    'sign-in': 'signIn',
    about: 'logo',
  }

  const contentKey = contentKeyMap[slug] || null

  return (
    <main className="flex flex-col justify-center font-sans min-h-screen bg-th-secondary-100 mt-[-20px]">
      <Head>
        <title>{t('LEVEL')}</title>
        <meta name="description" content={t('MainBlocks.LevelText')} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <StartPage defaultContentKey={contentKey} />
    </main>
  )
}

export default SlugPage

export async function getStaticPaths() {
  const paths = [
    { params: { slug: 'what-is-level' } },
    { params: { slug: 'how-it-works' } },
  ]

  return {
    paths,
    fallback: true,
  }
}

export async function getStaticProps({ locale = 'en' }) {
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
