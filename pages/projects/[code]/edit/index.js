import { useRouter } from 'next/router'
import ProjectEdit from '../../../../components/ProjectEdit'

function ProjectPageEdit() {
  const router = useRouter()
  const { code } = router.query

  return <ProjectEdit code={code} />
}

export default ProjectPageEdit
