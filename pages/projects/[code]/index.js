import { useRouter } from 'next/router'

import Project from 'components/Project/Project'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

function ProjectPage() {
  const router = useRouter()
  const { code } = router.query

  return <Project code={code} />
}

export default ProjectPage

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        'projects',
        'common',
        'books',
        'chapters',
        'book-properties',
        'users',
        'about',
        'start-page',
      ])),
    },
  }
}
