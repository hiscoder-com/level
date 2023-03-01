import Link from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { useCurrentUser } from 'lib/UserContext'
import { useRedirect } from 'utils/hooks'

import SwitchLocalization from 'components/SwitchLocalization'

import VcanaLogo from 'public/vcana-logo.svg'
import OmbLogo from 'public/omb-logo.svg'
import Login from 'components/Login'

export default function Home() {
  const { user } = useCurrentUser()
  const { href } = useRedirect({
    user,
    startLink: '/login',
  })

  const { locale, pathname, query, asPath } = useRouter()
  const { t } = useTranslation('common', 'users')
  return (
    <main className="layout-empty bg-[#E5E5E5]">
      <Head>
        <title>{t('V-CANA')}</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col items-center">
        <VcanaLogo className="mb-10 max-w-xs sm:max-w-md w-28" />
        <div className="bg-white h-[353px] w-[310px] max-w-xs mb-10 rounded-lg shadow-lg shadow-[#0000001A]">
          <Login />
        </div>
        <div className="text-[#909090] mb-4 text-center">Разработано:</div>
        <OmbLogo />
      </div>
      {/* <div className="absolute top-10 right-10">
        <SwitchLocalization />
      </div>
      <div className="flex">
        <div className=" w-1/2 flex flex-col items-center justify-center">
          <div className="w-96 flex flex-col items-center">
            <VcanaLogo className="mb-9 max-w-xs sm:max-w-md w-40" />
            <h2 className="h4 mb-24 text-center">{`Платформа для переводчиков Библии по системе “CANA”`}</h2>
            <div className="text-[#909090] mb-4">Разработано:</div>
            <OmbLogo />
          </div>
        </div>
        <div className="w-[950px] h-[900px] rounded-l-[128px] bg-[url('../public/login_image.png')] bg-no-repeat right-0 flex justify-center items-center">
          <div className="w-[560px] h-[468px] bg-white"></div>
        </div>
      </div> */}
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
