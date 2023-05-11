import { useRouter } from 'next/router'
import Link from 'next/link'

import { useTranslation } from 'next-i18next'
import i18nextConfig from 'next-i18next.config'

function SwitchLocalization() {
  const { locale, pathname, query, asPath } = useRouter()
  const { t } = useTranslation('common')
  const supportedLngs = i18nextConfig.i18n.locales
  return (
    <div className="text-xs lg:text-base font-bold">
      {supportedLngs.map((loc) => (
        <Link key={loc} href={{ pathname, query }} as={asPath} locale={loc}>
          <a className={`text-black p-2 ${locale === loc ? 'opacity-50' : ''}`}>
            {t(loc.toUpperCase())}
          </a>
        </Link>
      ))}
    </div>
  )
}

export default SwitchLocalization
