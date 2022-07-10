import { useRouter } from 'next/router'
import ProjectEdit from '../../../../components/ProjectEdit'
function Projects() {
  const router = useRouter()
  const { code, role } = router.query

  return <ProjectEdit code={code} role={role} />
}

export default Projects
