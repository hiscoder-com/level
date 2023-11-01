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
            className="underline text-th-link hover:text-th-link-hover"
            rel="noreferrer"
          >
            https://texttree.org/
          </a>
        </p>
        <Link
          href="/confession-steps"
          className="btn-secondary hover:bg-th-btn-background-primary hover:text-th-text-primary"
        >
          {t('Start')}
        </Link>
      </div>
    </div>
  )
}

Confession.backgroundColor = 'bg-th-background-secondary'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'users'])),
    },
  }
}
