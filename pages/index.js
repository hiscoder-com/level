import Head from 'next/head'
import Link from 'next/link'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Login from 'components/Login'

import VcanaLogo from 'public/vcana-logo.svg'

import OmbLogo from 'public/omb-logo.svg'

export default function Home() {
  const { t } = useTranslation('common')
  return (
    <main className="layout-empty bg-[#f4f4f4]">
      <Head>
        <title>{t('V-CANA')}</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col items-center sm:hidden">
        <VcanaLogo className="my-[6vh] max-w-xs sm:max-w-md w-28" />
        <div className="bg-white w-[90vw] mb-10 rounded-lg shadow-lg shadow-[#0000001A]">
          <Login />
        </div>
        <div className="text-[#909090] mb-4 text-center">{t('DevelopedBy')}</div>
        <Link href="https://openmediabible.com/" target="_blank">
          <OmbLogo className="logo mb-4" />
        </Link>
      </div>

      <div className="hidden sm:flex">
        <div className="flex flex-col items-center justify-center w-1/2">
          <div className="flex flex-col items-center text-base xl:text-lg">
            <VcanaLogo className="max-w-xs w-28 xl:w-40 mb-9" />
            <h1 className="mb-10 2xl:mb-20 text-center">
              {t('PlatformForBibleTranslate')}
            </h1>
            <div className="text-[#909090] mb-4">{t('DevelopedBy')}</div>
            <Link href="https://openmediabible.com/" target="_blank">
              <OmbLogo className="logo" />
            </Link>
          </div>
        </div>
        <div className="flex justify-center items-center my-4 w-1/2 min-h-[90vh] bg-[url('../public/login_image.jpg')] bg-cover bg-no-repeat rounded-l-lg lg:rounded-l-[48px] xl:rounded-l-[72px] 2xl:rounded-l-[120px] ">
          <div className="w-5/6 xl:w-3/4 2xl:w-3/5 bg-white rounded-lg shadow-lg shadow-[#0000001A] ">
            <Login />
          </div>
        </div>
      </div>
    </main>
  )
}

Home.layoutType = 'empty'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'users'])),
    },
  }
}
