import React, { useEffect, useState } from 'react'
import { useUser } from '../lib/UserContext'
import { useUsers, useCurrentUser } from '../utils/hooks'
import Languages from './Languages'
import Projects from './Projects'
import SignOut from './SignOut'

function Account({ id }) {
  const { user, session } = useUser()
  const [data] = useCurrentUser({ token: session?.access_token, id })
  const [showProjects, setShowProjects] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showLanguages, setShowLanguages] = useState(true)
  const [languageCode, setLanguageCode] = useState(null)

  useEffect(() => {
    if (!data) {
      return
    }
    setIsAdmin(data?.is_admin)
  }, [data])

  return (
    <div>
      <h1>Личный кабинет</h1>
      {data && (
        <div className="divide-y divide-gray-400">
          <div>
            <p>Login: {data.login}</p>
            <p>Email:{data.email}</p>
            <SignOut />
          </div>

          {showLanguages && (
            <Languages
              setShowProjects={setShowProjects}
              setShowLanguages={setShowLanguages}
              setLanguageCode={setLanguageCode}
              isAdmin={isAdmin}
            />
          )}
          {showProjects && languageCode &&<Projects languageCode={languageCode} />}
        </div>
      )}
    </div>
  )
}

export default Account
