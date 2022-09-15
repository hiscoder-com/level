import Link from 'next/link'

import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Projects from 'components/Projects'
import { useCurrentUser } from 'lib/UserContext'

export default function ProjectsPage() {
  const { user } = useCurrentUser()

  return (
    <>
      <Projects />
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
      ...(await serverSideTranslations(locale, ['projects'])),
      // Will be passed to the page component as props
    },
  }
}
