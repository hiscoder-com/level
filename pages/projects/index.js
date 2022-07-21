import Link from 'next/link'

import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Projects from '../../components/Projects'
import { useCurrentUser } from '../../lib/UserContext'

export default function ProjectsPage() {
  const { user } = useCurrentUser()

  return (
    <>
      <Projects />
      {user?.is_admin && (
        <Link href={'/projects/create'}>
          <a className="btn-cyan">Add New</a>
        </Link>
      )}
    </>
  )
}
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
      // Will be passed to the page component as props
    },
  }
}
