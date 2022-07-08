import { useRouter } from 'next/router'
import ProjectEdit from '../../../components/ProjectEdit'
function Projects() {
  const router = useRouter()
  const { code } = router.query

  return <ProjectEdit code={code} />
}

export default Projects
