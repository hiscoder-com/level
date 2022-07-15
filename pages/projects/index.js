import Projects from '../../components/Projects'
import Link from 'next/link'

import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export default function ProjectsPage() {
  return (
    <>
      <Projects />
      <Link href={'/projects/create'}>
        <a className="btn-filled btn">Add New</a>
      </Link>
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
