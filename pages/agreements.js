import Link from 'next/link'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export default function Agreements() {
  const { t } = useTranslation('common', 'users')

  return (
    <div className="layout-appbar">
      <div className="flex flex-col text-center space-y-2.5">
        <Link href="/user-agreement">
          <a className="btn-white w-64">{t('users:Agreement')}</a>
        </Link>
        <Link href="/confession">
          <a className="btn-white w-64">{t('ConfessionFaith')}</a>
        </Link>
        <Link href="/user-agreement">
          <a className="btn-cyan w-64">{t('Next')}</a>
        </Link>
      </div>
    </div>
  )
}

Agreements.backgroundColor = 'bg-white'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'users'])),
    },
  }
}
