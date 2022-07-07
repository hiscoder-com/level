import { useRouter } from 'next/router'
import Account from '../../components/Account'

function Projects() {
  const router = useRouter()
  const { id } = router.query

  return <Account id={id} />
}

export default Projects
