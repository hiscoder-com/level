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
        <div className="divide-y divide-gray-400">
          <div>
            <p>
              {t('Id')}: {user.id}
            </p>
            <p>
              {t('Login')}: {user.login}
            </p>
            <p>
              {t('users:Email')}: {user.email}
            </p>
            <SignOut />
          </div>
          <Projects />
        </div>
      )}
    </>
  )
}

export default Account
