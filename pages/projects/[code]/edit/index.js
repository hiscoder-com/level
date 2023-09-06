import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import ProjectEdit from 'components/ProjectEdit/ProjectEdit'

function ProjectPageEdit() {
  return <ProjectEdit />
}

export default ProjectPageEdit

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        'common',
        'project-edit',
        'projects',
        'users',
      ])),
    },
  }
}
