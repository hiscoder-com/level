import Link from 'next/link'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import NotFound from 'public/404-error.svg'

export default function PageNotFound() {
  const { t } = useTranslation(['error'])
  return (
    <div className="relative layout-appbar bg-th-primary-100">
      <NotFound className="not-found absolute max-w-xl lg:max-w-3xl xl:max-w-5xl top-16 z-10" />
      <div className="text-th-primary-300 text-[152px] sm:text-[200px] md:text-[248px] lg:text-[296px] xl:text-[360px] font-semibold">
        404
      </div>
      <div className="flex flex-col items-center mt-28 md:mt-0 lg:mt-12 xl:mt-16 justify-center text-2xl font-bold text-th-primary-300 text-center">
        <h2>{t('PageNotFound')}</h2>
        <p>
          <Link href="/" className="text-2xl text-th-secondary-400 hover:opacity-70">
            {t('GoTo')}
            {t('Homepage')}
          </Link>
        </p>
      </div>
    </div>
  )
}

PageNotFound.backgroundColor = 'bg-th-primary-100'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['error', 'users'])),
    },
  }
}
