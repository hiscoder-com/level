import Link from 'next/link'
import { useRouter } from 'next/router'

import GlokasLogo from 'public/glokas-logo.svg'

function Logo({ t }) {
  const { locale } = useRouter()
  const isRuLocale = locale === 'ru'
  return (
    <div className="flex flex-col w-full gap-6">
      <p className="font-semibold md:font-bold mr-10">{t('LogoHeader')}</p>
      <div
        className={`overflow-auto pr-5 flex flex-col w-full gap-6 text-sm md:${
          isRuLocale ? 'text-sm' : 'text-base'
        } font-normal`}
      >
        <p>{t('LogoText.p1')}</p>
        <p>{t('LogoText.p2')}</p>
        <p>{t('LogoText.p3')}</p>
        <p>{t('LogoText.p4')}</p>
        <p>{t('LogoText.p5')}</p>

        <div className="flex items-center gap-5 md:gap-10 flex-col md:flex-row">
          <Link href="https://glokas.com" target="_blank">
            <GlokasLogo />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Logo
