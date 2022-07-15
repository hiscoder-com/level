import { useRouter } from 'next/router'
import Project from '../../components/Project'

function Projects() {
  const router = useRouter()
  const { code } = router.query

  return <Project code={code} />
}

export default Projects
