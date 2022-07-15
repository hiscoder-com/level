import { useRouter } from 'next/router'

import { useCurrentUser } from '../../lib/UserContext'
import { useUser } from '../../utils/hooks'

function UserPage() {
  const router = useRouter()
  const { login } = router.query
  const { session } = useCurrentUser()
  const [user, { mutate }] = useUser(session?.access_token, login)
  const handleBlock = (block) => {
    console.log({ block })
  }
  return (
    <div>
      <h1>UserPage</h1>
      <div>Login: {user?.login}</div>
      <div>Email: {user?.email}</div>
      <div>
        <div onClick={() => handleBlock(!user?.blocked)}>
          {user?.blocked ? 'unblock' : 'block'}
        </div>
      </div>
    </div>
  )
}

export default UserPage
