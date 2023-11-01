import Link from 'next/link'

import { useTranslation } from 'next-i18next'

import AboutVersion from './AboutVersion'

import VcanaLogo from 'public/vcana-logo.svg'
import OmbLogo from 'public/omb-logo.svg'

function StartPage({ children }) {
  const { t } = useTranslation('common')
  return (
    <>
      <div className="flex flex-col items-center sm:hidden">
        <div className="flex items-center mb-2">
          <VcanaLogo className="max-w-xs my-10 sm:max-w-md w-28" />
          <AboutVersion isMobileIndexPage={true} />
        </div>
        <div className="bg-th-background-secondary w-[90vw] mb-10 rounded-lg shadow-lg">
          {children}
        </div>
        <div className="text-th-text-disabled mb-4 text-center">{t('DevelopedBy')}</div>
        <Link href="https://openmediabible.com/" target="_blank">
          <OmbLogo className="logo mb-4" />
        </Link>
      </div>

      <div className="hidden sm:flex">
        <div className="flex flex-col items-center justify-center w-1/2">
          <div className="flex flex-col items-center text-base xl:text-lg">
            <div className="flex flex-col relative items-center">
              <VcanaLogo className="w-44 xl:w-52 mb-4" />
              <AboutVersion />
            </div>
            <h1 className="my-4 text-center">{t('PlatformForBibleTranslate')}</h1>
            <div className="text-th-text-disabled mb-2 text-xs">{t('DevelopedBy')}</div>
            <Link href="https://openmediabible.com/" target="_blank">
              <OmbLogo className="logo" />
            </Link>
          </div>
        </div>
        <div className="flex justify-center items-center my-4 w-1/2 min-h-[90vh] bg-[url('../public/login_image.jpg')] bg-cover bg-no-repeat rounded-l-lg lg:rounded-l-[48px] xl:rounded-l-[72px] 2xl:rounded-l-[120px]">
          <div className="w-5/6 xl:w-3/4 2xl:w-3/5 bg-white rounded-lg shadow-lg">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

export default StartPage
