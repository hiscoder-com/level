import Head from 'next/head'
import Link from 'next/link'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import AboutVersion from 'components/AboutVersion'
import Login from 'components/Login'

import OmbLogo from 'public/omb-logo.svg'
import VcanaLogo from 'public/vcana-logo.svg'

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
        <div className="flex items-center mb-2">
          <VcanaLogo className="max-w-xs my-[6vh] sm:max-w-md w-28" />
          <AboutVersion isMobileIndexPage={true} />
        </div>
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
            <div className="flex flex-col relative items-center">
              <VcanaLogo className="scale-[1.65] xl:scale-[1.85] mb-4" />
              <AboutVersion />
            </div>
            <h1 className="my-4 text-center">{t('PlatformForBibleTranslate')}</h1>
            <div className="text-[#909090] mb-2 text-xs">{t('DevelopedBy')}</div>
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
