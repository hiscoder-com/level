import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import Projects from 'components/Projects'

import { useCurrentUser } from 'lib/UserContext'
import PersonalList from './PersonalList'

function Account() {
  const { user, loading } = useCurrentUser()
  const router = useRouter()
  const [accountType, setAccountType] = useState('account')

  const { t } = useTranslation(['users'])

  useEffect(() => {
    if (!loading && user === null) {
      router.push('/')
    }
  }, [router, user, loading])

  return (
    <div className="mx-auto max-w-7xl">
      {user?.id && (
        <div className="divide-y divide-darkBlue">
          <div className="grid grid-cols-2 gap-7  md:grid-cols-3 md:mt-24 xl:grid-cols-5 md:text-xl font-bold text-center">
            <button
              disabled={accountType === 'account'}
              onClick={() => setAccountType('account')}
              className={accountType === 'account' ? 'tab-active' : 'tab cursor-pointer'}
            >
              {t('Account')}
            </button>
            <button
              disabled={accountType === 'projects'}
              onClick={() => setAccountType('projects')}
              className={
                accountType === 'projects' ? 'tab-active ' : 'tab cursor-pointer'
              }
            >
              {t('Projects')}
            </button>
          </div>
          <div>
            {accountType === 'account' && <PersonalList />}
            {accountType === 'projects' && <Projects />}
          </div>
        </div>
      )}
    </div>
  )
}

export default Account
