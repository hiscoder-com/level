import { useEffect } from 'react'
import { useRouter } from 'next/router'

import Languages from './Languages'
import Projects from './Projects'
import SignOut from './SignOut'
import { useCurrentUser } from '../lib/UserContext'

function Account() {
  const { user, loading } = useCurrentUser()
  const router = useRouter()
  useEffect(() => {
    if (!loading && user === null) {
      router.push('/')
    }
  }, [router, user, loading])
  return (
    <div className="container">
      <h1>Личный кабинет</h1>
      {user?.id && (
        <div className="divide-y divide-gray-400">
          <div>
            <p>Id: {user.id}</p>
            <p>Login: {user.login}</p>
            <p>Email:{user.email}</p>
            <SignOut />
          </div>

          {user?.is_admin ? (
            <Languages isAdmin={user.is_admin /** TODO что это за параметр */} />
          ) : (
            <Projects id={user.id} />
          )}
        </div>
      )}
    </div>
  )
}

export default Account
