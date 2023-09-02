import { useEffect } from 'react'
import { useRouter } from 'next/router'

import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { useSetRecoilState } from 'recoil'

import Project from 'components/Project/Project'

import { isSwitchingPageState } from 'components/state/atoms'

function ProjectPage() {
  const router = useRouter()
  const { code } = router.query
  const setSwitchingPage = useSetRecoilState(isSwitchingPageState)
  useEffect(() => {
    setSwitchingPage(false)
  }, [setSwitchingPage])

  return <Project code={code} setSwitchingPage={setSwitchingPage} />
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
      ])),
    },
  }
}
