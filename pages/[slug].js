import Head from 'next/head'
import { useRouter } from 'next/router'

import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'react-i18next'

import GeCraftLink from 'components/StartPage/GeCraftLink'
import StartPage from 'components/StartPage/StartPage'
import StartPageMobile from 'components/StartPage/StartPageMobile'

import { urlGlobal } from 'utils/openGraph'

const SlugPage = () => {
  const router = useRouter()
  const { slug } = router.query
  const { t } = useTranslation(['start-page', 'projects', 'users', 'common'])

  const contentMap = {
    'sign-in': {
      contentKey: 'signIn',
      title: 'Sign in to LEVEL | Bible Translation Platform',
      description:
        'Sign in to your LEVEL account to access Bible translation projects, tools, and resources tailored for your translation needs.',
    },
    'connect-with-us': {
      contentKey: 'connect',
      title: 'Connect with LEVEL | Contact and Support',
      description:
        'Get in touch with the LEVEL team. Reach out for support, inquiries, or collaboration opportunities through our contact form.',
    },
    updates: {
      contentKey: 'updates',
      title: 'LEVEL Updates | Version History and Features',
      description:
        'Stay up-to-date with the latest versions and feature updates for LEVEL, the Bible translation platform. Explore new functionalities added over time.',
    },
    'what-is-level': {
      contentKey: 'intro',
      title: 'What is LEVEL? | Step-by-Step Bible Translation Platform',
      description:
        'Discover LEVEL, a platform that supports step-by-step Bible translation, offering translators access to essential resources for each stage of the process.',
    },
    reviews: {
      contentKey: 'reviews',
      title: 'Reviews | LEVEL Bible Translation Platform',
      description:
        'Read user reviews and testimonials about LEVEL, the innovative platform designed for efficient and accessible Bible translation.',
    },
    'how-it-works': {
      contentKey: 'howItWork',
      title: 'How LEVEL Works | Streamlined Bible Translation Process',
      description:
        'Learn how LEVEL helps Bible translators through every stage—from reading the text to final edits—using custom tools for each translation method.',
    },
    faq: {
      contentKey: 'faq',
      title: 'FAQ | LEVEL Bible Translation Platform',
      description:
        "Find answers to frequently asked questions about LEVEL's Bible translation platform, its tools, and how it supports the translation process.",
    },
    download: {
      contentKey: 'download',
      title: 'Download LEVEL | Bible Translation Software',
      description:
        "Download the LEVEL desktop version for offline Bible translation. Available for Windows and Linux with a built-in test project to explore the platform's features.",
    },
    partners: {
      contentKey: 'partners',
      title: 'LEVEL Partners | Collaborating for Bible Translation',
      description:
        'Meet the partners who work with LEVEL to bring Bible translation tools and resources to translators around the world.',
    },
    about: {
      contentKey: 'logo',
      title: 'About LEVEL | Powered for Bible Translation',
      description:
        'Learn about LEVEL—a translation and localization platform created to assist Christian ministries in spreading the Gospel through efficient Bible translation.',
    },
  }

  const pageContent = contentMap[slug] || {}
  const imageUrl = `${urlGlobal}/social.webp`

  return (
    <main className="flex min-h-screen flex-col bg-th-secondary-100 font-sans">
      <Head>
        <title>{pageContent.title || t('LEVEL')}</title>
        <meta
          name="description"
          content={pageContent.description || t('MainBlocks.LevelText') || 'LEVEL'}
        />

        <meta property="og:title" content={pageContent.title || t('LEVEL')} />
        <meta
          property="og:description"
          content={pageContent.description || t('MainBlocks.LevelText') || 'LEVEL'}
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={`https://deploy-preview-721--level-bible.netlify.app/${slug}`}
        />
        <meta property="og:site_name" content="LEVEL" />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/webp" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageContent.title || t('LEVEL')} />
        <meta
          name="twitter:description"
          content={pageContent.description || t('MainBlocks.LevelText') || 'LEVEL'}
        />
        <meta name="twitter:image" content={imageUrl} />

        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="hidden md:block">
          <StartPage defaultContentKey={pageContent.contentKey || null} />
        </div>

        <div className="block w-full md:hidden">
          <StartPageMobile defaultContentKey={pageContent.contentKey || null} />
        </div>
      </div>
      <GeCraftLink />
    </main>
  )
}

SlugPage.layoutType = 'empty'

export default SlugPage

export async function getStaticPaths() {
  const paths = [
    { params: { slug: 'what-is-level' } },
    { params: { slug: 'how-it-works' } },
    { params: { slug: 'sign-in' } },
    { params: { slug: 'connect-with-us' } },
    { params: { slug: 'updates' } },
    { params: { slug: 'reviews' } },
    { params: { slug: 'faq' } },
    { params: { slug: 'download' } },
    { params: { slug: 'partners' } },
    { params: { slug: 'about' } },
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
