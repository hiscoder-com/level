import { useRouter } from 'next/router'

import Project from '../../../components/Project'

function ProjectPage() {
  const router = useRouter()
  const { code } = router.query

  return <Project code={code} />
}

export default ProjectPage
