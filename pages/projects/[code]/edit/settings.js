import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import ProjectSettings from 'components/ProjectSettings'

function ProjectPageEdit() {
  return <ProjectSettings />
}

export default ProjectPageEdit

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'project-edit'])),
    },
  }
}
