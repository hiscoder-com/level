import Link from 'next/link'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export default function Confession() {
  const { t } = useTranslation('common', 'users')
  return (
    <div className="layout-appbar">
      <div className="mx-5 max-w-lg text-center whitespace-pre-line">
        <h1 className="mb-6 text-4xl">{t('users:Confession')}:</h1>
        <p
          dangerouslySetInnerHTML={{
            __html: t('DescriptionConfession', { interpolation: { escapeValue: false } }),
          }}
          className="mb-2"
        />
        <p className="text-sm font-light mb-7">
          {t('OfficialVersion')}
          <a
            href="https://texttree.org/"
            target={'_blank'}
            className="underline text-th-primary-link hover:text-th-hover-primary-link"
            rel="noreferrer"
          >
            https://texttree.org/
          </a>
        </p>
        <Link
          href="/confession-steps"
          className="btn-secondary hover:bg-th-primary-btn-background hover:text-th-primary-text"
        >
          {t('Start')}
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
