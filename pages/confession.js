import Link from 'next/link'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export default function Confession() {
  const { t } = useTranslation('common', 'users')
  return (
    <div className="layout-appbar">
      <div className="text-center mx-5 max-w-lg whitespace-pre-line">
        <h1 className="h1 mb-6">{t('users:Confession')}:</h1>

        <p
          dangerouslySetInnerHTML={{
            __html: t('DescriptionConfession', { interpolation: { escapeValue: false } }),
          }}
          className="h5 mb-2"
        />
        <p className="h6 font-light">
          {t('OfficialVersion')}
          <a
            href="https://texttree.org/"
            target={'_blank'}
            className="underline text-cyan-600"
            rel="noreferrer"
          >
            https://texttree.org/
          </a>
        </p>
        <Link href="/confession-steps">
          <a className="btn-cyan w-28 mt-7">{t('Start')}</a>
        </Link>
      </div>
    </div>
  )
}
Confession.backgroundColor = 'bg-white'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'users'])),
    },
  }
}
