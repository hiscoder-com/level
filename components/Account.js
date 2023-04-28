import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import ProjectCreate from './ProjectCreate'
import Projects from './Projects'

import { useCurrentUser } from 'lib/UserContext'

function Account() {
  const { user, loading } = useCurrentUser()
  const router = useRouter()
  const [type, setType] = useState('account')

  const { t } = useTranslation(['users'])

  useEffect(() => {
    if (!loading && user === null) {
      router.push('/')
    }
  }, [router, user, loading])
  const tabs = [
    { type: 'account', label: 'Account' },
    {
      type: 'projects',
      label: 'projects:Projects',
    },
    {
      type: 'create',
      label: 'projects:CreateProject',
    },
  ]
  return (
    <div className="mx-auto max-w-7xl">
      {user?.id && (
        <div className="divide-y divide-darkBlue">
          <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-7 mt-2 lg:text-lg font-bold text-center">
            {tabs
              .filter((tab) => (user.is_admin ? true : tab.type !== 'create'))
              .map((tab) => (
                <button
                  key={tab.type}
                  disabled={type === tab.type}
                  onClick={() => setType(tab.type)}
                  className={type === tab.type ? 'tab-active' : 'tab'}
                >
                  {t(tab.label)}
                </button>
              ))}
          </div>
          <div>{type === 'create' ? <ProjectCreate /> : <Projects type={type} />}</div>
        </div>
      )}
    </div>
  )
}

export default Account
