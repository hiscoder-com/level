import ProjectCreate from 'components/ProjectCreate'

import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

function ProjectCreatePage() {
  return <ProjectCreate />
}

export default ProjectCreatePage

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['projects', 'common'])),
    },
  }
}
