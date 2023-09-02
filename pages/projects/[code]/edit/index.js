import { useEffect } from 'react'

import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { useSetRecoilState } from 'recoil'

import ProjectEdit from 'components/ProjectEdit/ProjectEdit'
import { isSwitchingPageState } from 'components/state/atoms'

function ProjectPageEdit() {
  const setSwitchingPage = useSetRecoilState(isSwitchingPageState)

  useEffect(() => {
    setSwitchingPage(false)
  }, [setSwitchingPage])

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
