import { useRouter } from 'next/router'
import Account from '../../components/Account'
import { useUser } from '../../lib/UserContext'

function Projects() {
  const router = useRouter()
  const { id } = router.query
  const { user, session } = useUser()
  if (user) {
    router.push(`/account/${user?.id}`)
  }
  return <Account id={user?.id} /> //TODO сделать, чтобы ничего не возвращалось, реально?
}

export default Projects
