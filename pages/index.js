import Head from 'next/head'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Login from 'components/Login'

import VcanaLogo from 'public/vcana-logo.svg'
import OmbLogo from 'public/omb-logo.svg'

export default function Home() {
  const { t } = useTranslation('common', 'users')
  return (
    <main className="layout-empty bg-[#E5E5E5]">
      <Head>
        <title>{t('V-CANA')}</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col items-center sm:hidden">
        <VcanaLogo className="mb-10 max-w-xs sm:max-w-md w-28" />
        <div className="bg-white w-screen max-w-xs mb-10 rounded-lg shadow-lg shadow-[#0000001A]">
          <Login />
        </div>
        <div className="text-[#909090] mb-4 text-center">{t('common:DevelopedBy')}</div>
        <OmbLogo />
      </div>

      <div className="hidden sm:flex">
        <div className="flex flex-col items-center justify-center w-1/2">
          <div className="flex flex-col items-center px-10 lg:px-24 xl:px-40 2xl:px-72 text-base xl:text-lg">
            <VcanaLogo className="max-w-xs w-28 xl:w-40 mb-9" />
            <h1 className="mb-10 2xl:mb-20 text-center">
              {t('common:PlatformForBibleTranslatorsBySystemCana')}
            </h1>
            <div className="text-[#909090] mb-4">{t('common:DevelopedBy')}</div>
            <OmbLogo />
          </div>
        </div>
        <div className="flex justify-center w-1/2 py-11 px-5 lg:py-20 lg:px-14 2xl:py-44 bg-[url('../public/login_image.png')] bg-cover bg-no-repeat rounded-l-lg lg:rounded-l-[48px] xl:rounded-l-[72px] ">
          <div className="w-screen max-w-xs lg:max-w-md xl:max-w-lg 2xl:max-w-xl bg-white rounded-lg shadow-lg shadow-[#0000001A] ">
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
