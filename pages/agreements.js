import Link from 'next/link'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export default function Agreements() {
  const { t } = useTranslation('users', 'common')

  return (
    <div className="layout-appbar">
      <div className="flex flex-col text-center space-y-2.5">
        {/*TODO Исправить логику ссылок или редиректа */}
        <Link
          href="/user-agreement"
          className="btn-base bg-th-primary-btn-background hover:bg-th-primary hover:text-th-secondary-text w-64"
        >
          {t('Agreement')}
        </Link>
        <Link
          href="/confession"
          className="btn-base bg-th-primary-btn-background hover:bg-th-primary hover:text-th-secondary-text w-64"
        >
          {t('Confession')}
        </Link>
        <Link
          href="/user-agreement"
          className="btn-base bg-th-primary-btn-background hover:bg-th-primary hover:text-th-secondary-text w-64"
        >
          {t('common:Next')}
        </Link>
      </div>
    </div>
  )
}

Agreements.backgroundColor = 'bg-white'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['users', 'common'])),
    },
  }
}
