import { useRouter } from 'next/router'

import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Project from 'components/Project'

function ProjectPage() {
  const router = useRouter()
  const { code } = router.query

  return <Project code={code} />
}

export default ProjectPage

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['projects'])),
      // Will be passed to the page component as props
    },
  }
}
