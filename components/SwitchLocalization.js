import { useRouter } from 'next/router'
import Link from 'next/link'

import { useTranslation } from 'next-i18next'

function SwitchLocalization() {
  const { locale, pathname, query, asPath } = useRouter()
  const { t } = useTranslation('common')

  return (
    <div className="font-bold text-xl lg:text-base">
      <Link href={{ pathname, query }} as={asPath} locale={'ru'}>
        <a className={`text-teal-500 p-2 ${locale === 'ru' ? 'opacity-50' : ''}`}>
          {t('RU')}
        </a>
      </Link>
      <Link replace href={{ pathname, query }} as={asPath} locale={'en'}>
        <a className={`text-teal-500 p-2 ${locale === 'en' ? 'opacity-50' : ''}`}>
          {t('EN')}
        </a>
      </Link>
    </div>
  )
}

export default SwitchLocalization
