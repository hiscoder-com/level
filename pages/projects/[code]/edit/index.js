import ProjectEdit from 'components/ProjectEdit/ProjectEdit'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

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
        'about',
        'start-page',
      ])),
    },
  }
}
