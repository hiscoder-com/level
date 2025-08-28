import Head from 'next/head'
import { useRouter } from 'next/router'

import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import GeCraftLink from 'components/StartPage/GeCraftLink'
import StartPage from 'components/StartPage/StartPage'
import StartPageMobile from 'components/StartPage/StartPageMobile'

import { openGraph, urlGlobal } from '../utils/openGraph'

const metadata = {
  title: {
    default: 'LEVEL',
    template: '%s | Step-by-Step Bible Translation',
  },
  description:
    'LEVEL is a platform for Bible translation in any language, offering tools, resources, and collaboration features to streamline and simplify the translation process.',
  openGraph: { ...openGraph },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function Home() {
  const { query } = useRouter()

  return (
    <main className="flex min-h-screen flex-col bg-th-secondary-100 font-sans">
      <Head>
        <title>{metadata.title.template.replace('%s', metadata.title.default)}</title>
        <meta name="description" content={metadata.description} />
        <meta property="og:title" content={metadata.openGraph.title} />
        <meta property="og:description" content={metadata.openGraph.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${urlGlobal}`} />
        <meta property="og:site_name" content={metadata.title.default} />
        <meta property="og:image" content={metadata.openGraph.images[0].url} />
        <meta property="og:image:width" content={metadata.openGraph.images[0].width} />
        <meta property="og:image:height" content={metadata.openGraph.images[0].height} />
        <meta property="og:image:type" content="image/webp" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadata.openGraph.title} />
        <meta name="twitter:description" content={metadata.openGraph.description} />
        <meta name="twitter:image" content={metadata.openGraph.images[0].url} />

        <link rel="icon" href={metadata.icons.icon} sizes="any" />
      </Head>
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="hidden md:block">
          <StartPage defaultContentKey={query?.contentKey || null} />
        </div>

        <div className="block w-full md:hidden">
          <StartPageMobile defaultContentKey={query?.contentKey || null} />
        </div>
      </div>
      <GeCraftLink />
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
