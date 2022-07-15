import { useEffect } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export default function Agreements() {
  const { t } = useTranslation('common')

  return (
    <div className="layout-appbar">
      <div className="flex flex-col text-center space-y-2.5">
        <Link href="/user-agreement">
          <a className="btn-transparent w-64">{t('Agreements')}</a>
        </Link>
        <Link href="/confession">
          <a className="btn-transparent w-64">{t('ConfessionFaith')}</a>
        </Link>
        <Link href="/user-agreement">
          <a className="btn-filled w-64">{t('Next')}</a>
        </Link>
      </div>
    </div>
  )
}

Agreements.backgroundColor = 'bg-white'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
      // Will be passed to the page component as props
    },
  }
}
