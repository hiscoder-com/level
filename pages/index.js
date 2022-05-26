import Head from 'next/head'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export default function Home() {
  const { t } = useTranslation('common')
  return (
    <div className="container p-10">
      <Head>
        <title>V-CANA</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={'text-6xl py-8'}>{t('Welcome')}</div>
      <div className="flex flex-col">
        <Link href="/sign-up">
          <a
            className={
              'text-3xl py-3 px-4 rounded-xl bg-green-300 border-green-500 border max-w-xs text-center my-2'
            }
          >
            {t('SignUp')}
          </a>
        </Link>
        <Link href="/sign-in">
          <a
            className={
              'text-3xl py-3 px-4 rounded-xl bg-blue-300 border-blue-500 border max-w-xs text-center my-2'
            }
          >
            {t('SignIn')}
          </a>
        </Link>
      </div>
    </div>
  )
}
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
      // Will be passed to the page component as props
    },
  }
}
