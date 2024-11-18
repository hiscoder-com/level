import Link from 'next/link'
import { useRouter } from 'next/router'

import GlokasLogo from 'public/icons/glokas-logo.svg'

function Logo({ t }) {
  const { locale } = useRouter()
  const isRuLocale = locale === 'ru'
  return (
    <div className="flex w-full flex-col gap-6">
      <p className="mr-10 font-semibold md:font-bold">{t('LogoHeader')}</p>
      <div
        className={`flex w-full flex-col gap-6 overflow-auto pr-5 text-sm md:${
          isRuLocale ? 'text-sm' : 'text-base'
        } font-normal`}
      >
        <p>{t('LogoText.p1')}</p>
        <p>{t('LogoText.p2')}</p>
        <p>{t('LogoText.p3')}</p>
        <p>{t('LogoText.p4')}</p>
        <p>{t('LogoText.p5')}</p>

        <div className="flex flex-col items-center gap-5 md:flex-row md:gap-10">
          <Link href="https://glokas.com" target="_blank">
            <GlokasLogo />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Logo
