import React, { useEffect, useState } from 'react'
import { useUser } from '../lib/UserContext'
import { useUsers, useCurrentUser } from '../utils/hooks'
import Languages from './Languages'
import Projects from './Projects'
import SignOut from './SignOut'

function Account({ id }) {
  const { user, session } = useUser()
  const [currentUser] = useCurrentUser({ token: session?.access_token, id })
  return (
    <div className="container">
      <h1>Личный кабинет</h1>
      {currentUser && (
        <div className="divide-y divide-gray-400">
          <div>
            <p>Id: {currentUser.id}</p>
            <p>Login: {currentUser.login}</p>
            <p>Email:{currentUser.email}</p>
            <SignOut />
          </div>

          {currentUser?.is_admin ? (
            <Languages isAdmin={currentUser?.is_admin} />
          ) : (
            <Projects id={currentUser?.data?.id} />
          )}
        </div>
      )}
    </div>
  )
}

export default Account
