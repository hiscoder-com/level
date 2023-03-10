import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import ProjectCreate from 'components/ProjectCreate'

function ProjectCreatePage() {
  return <ProjectCreate />
}

export default ProjectCreatePage

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['projects', 'common', 'users'])),
    },
  }
}
