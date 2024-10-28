import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import StartPage from 'components/StartPage/StartPage'
import { openGraph } from '../utils/openGraph'

export const metadata = {
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
  const { t } = useTranslation('common')
  const { query } = useRouter()
  return (
    <main className="flex flex-col justify-center font-sans min-h-screen bg-th-secondary-100">
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
