import Projects from '../../components/Projects'

import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export default function ProjectsPage() {
  return (
    <>
      <Projects />
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
