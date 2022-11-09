import { useEffect } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import Projects from 'components/Projects'
import SignOut from 'components/SignOut'

import { useCurrentUser } from 'lib/UserContext'

function Account() {
  const { user, loading } = useCurrentUser()
  const router = useRouter()

  const { t } = useTranslation(['common', 'users'])

  useEffect(() => {
    if (!loading && user === null) {
      router.push('/')
    }
  }, [router, user, loading])

  return (
    <>
      {user?.id && (
        <>
          <p className="mt-3">
            {t('Login')}: <b>{user.login}</b>
          </p>
          <p>
            {t('users:Email')}: <b>{user.email}</b>
          </p>
          <SignOut />

          <Projects />
        </>
      )}
    </>
  )
}

export default Account
