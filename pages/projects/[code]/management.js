import { useRouter } from 'next/router'
import ProjectManagement from '../../../components/ProjectEdit'
function Projects() {
  const router = useRouter()
  const { code } = router.query

  return <ProjectManagement code={code} />
}

export default Projects
