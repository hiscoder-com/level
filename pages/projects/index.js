import Link from 'next/link'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { useCurrentUser } from 'lib/UserContext'

export default function ProjectsPage() {
  const { t } = useTranslation(['projects'])
  const { user } = useCurrentUser()

  return (
    <>
      {user?.is_admin && (
        <Link href={'/projects/create'}>
          <a className="btn-cyan">{t('AddNew')}</a>
        </Link>
      )}
    </>
  )
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['projects', 'common'])),
      // Will be passed to the page component as props
    },
  }
}
