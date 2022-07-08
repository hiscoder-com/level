import React, { useEffect, useState } from 'react'
import { useUser } from '../lib/UserContext'
import { useUsers, useCurrentUser } from '../utils/hooks'
import Languages from './Languages'
import Projects from './Projects'
import SignOut from './SignOut'

function Account({ id }) {
  const { user, session } = useUser()
  const [data] = useCurrentUser({ token: session?.access_token, id })
  const [isAdmin, setIsAdmin] = useState(false)
  // const [showProjects, setShowProjects] = useState(!data?.is_admin)

  const [showLanguages, setShowLanguages] = useState(data?.is_admin)
  const [languageCode, setLanguageCode] = useState(null)
  // console.log(first)
  useEffect(() => {
    if (!data) {
      return
    }

    setIsAdmin(data?.is_admin)
  }, [data])
  // useEffect(() => {
  //   first

  //   return () => {
  //     second
  //   }
  // }, [isAdmin])

  return (
    <div className="container">
      <h1>Личный кабинет</h1>
      {data && (
        <div className="divide-y divide-gray-400">
          <div>
            <p>Id: {data.id}</p>
            <p>Login: {data.login}</p>
            <p>Email:{data.email}</p>
            <SignOut />
          </div>

          {isAdmin && (
            <Languages
              // setShowProjects={setShowProjects}
              // setShowLanguages={setShowLanguages}
              // setLanguageCode={setLanguageCode}
              isAdmin={isAdmin}
            />
          )}
          {!isAdmin && <Projects isAdmin={isAdmin} id={isAdmin ? languageCode : id} />}
        </div>
      )}
    </div>
  )
}

export default Account
