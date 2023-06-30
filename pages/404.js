import Link from 'next/link'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import NotFound from 'public/404-error.svg'

const PageNotFound = () => {
  const { t } = useTranslation(['error'])
  return (
    <div className="layout-appbar">
      <NotFound className="max-w-4xl" />
      <div className="text-xl">
        <h2>{t('PageNotFound')}</h2>
        <p>
          {t('GoTo')}
          <Link href="/" className="text-2xl uppercase text-red-400 hover:text-stone-500">
            {t('Homepage')}
          </Link>
        </p>
      </div>
    </div>
  )
}
export default PageNotFound

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['error', 'users'])),
    },
  }
}
