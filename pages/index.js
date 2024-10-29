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
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content="https://deploy-preview-721--level-bible.netlify.app"
        />
        <meta property="og:site_name" content={metadata.title.default} />
        <meta property="og:image" content={metadata.openGraph.images[0].url} />
        <meta property="og:image:width" content={metadata.openGraph.images[0].width} />
        <meta property="og:image:height" content={metadata.openGraph.images[0].height} />
        <meta property="og:image:type" content="image/jpg" />
        <link rel="icon" href={metadata.icons.icon} sizes="any" />
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
