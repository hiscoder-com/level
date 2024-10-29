import Head from 'next/head'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import StartPage from 'components/StartPage/StartPage'
import { openGraph } from '../utils/openGraph'

const metadata = {
  title: {
    default: 'LEVEL',
    template: '%s | LEVEL',
  },
  description: 'LEVEL is an innovative platform for Bible translation.',
  openGraph: { ...openGraph },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function Home() {
  const { query } = useRouter()

  return (
    <main className="flex flex-col justify-center font-sans min-h-screen bg-th-secondary-100">
      <Head>
        <title>{metadata.title.template.replace('%s', metadata.title.default)}</title>
        <meta name="description" content={metadata.description} />
        <meta property="og:title" content={metadata.openGraph.title} />
        <meta property="og:description" content={metadata.openGraph.description} />
        <link rel="icon" href={metadata.icons.icon} />
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
