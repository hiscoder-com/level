import { useRouter } from 'next/router'
import React from 'react'
import { useUser } from '../lib/UserContext'
import { useAuthenticated, useUserProjectRole } from '../utils/hooks'
import Languages from './Languages'
import Projects from './Projects'
import SignOut from './SignOut'

function Account() {
  const { session } = useUser()
  const router = useRouter()
  const { id } = router?.query
  const [authenticated] = useAuthenticated({
    token: session?.access_token,
    id,
  })
  return (
    <div className="container">
      <h1>Личный кабинет</h1>
      {authenticated && (
        <div className="divide-y divide-gray-400">
          <div>
            <p>Id: {authenticated.id}</p>
            <p>Login: {authenticated.login}</p>
            <p>Email:{authenticated.email}</p>
            <SignOut />
          </div>

          {authenticated?.is_admin ? (
            <Languages isAdmin={authenticated?.is_admin} />
          ) : (
            <Projects id={authenticated?.data?.id} />
          )}
        </div>
      )}
    </div>
  )
}

export default Account
