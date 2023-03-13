import { useEffect } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import Projects from 'components/Projects'

import { useCurrentUser } from 'lib/UserContext'

function Account() {
  const { user, loading } = useCurrentUser()
  const router = useRouter()

  const { t } = useTranslation(['users', 'common'])

  useEffect(() => {
    if (!loading && user === null) {
      router.push('/')
    }
  }, [router, user, loading])

  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="h1">{t('common:Account')}</h1>

      {user?.id && (
        <>
          <p className="mt-3">
            {t('Login')}: <b>{user.login}</b>
          </p>
          <p>
            {t('Email')}: <b>{user.email}</b>
          </p>

          <Projects />
        </>
      )}
    </div>
  )
}

export default Account
