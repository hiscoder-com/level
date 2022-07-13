import Link from 'next/link'
import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { useUser } from '../lib/UserContext'

import { useRedirect } from '../utils/hooks'

export default function Confession() {
  const { t } = useTranslation('common')
  const router = useRouter()

  const { user, session } = useUser()
  const { href } = useRedirect({
    userId: user?.id,
    token: session?.access_token,
    startLink: '/confession-steps',
  })

  return (
    <div className="layout-appbar">
      <div className="text-center max-w-lg whitespace-pre-line">
        <h1 className="h1 mb-6">{t('ConfessionFaith')}:</h1>

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
        <Link href={router?.route === '/confession' ? '/confession-steps' : href}>
          <a className="btn-filled w-28 mt-7">{t('Start')}</a>
        </Link>
      </div>
    </div>
  )
}
Confession.backgroundColor = 'bg-white'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
      // Will be passed to the page component as props
    },
  }
}
