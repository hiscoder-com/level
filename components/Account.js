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

  const { t } = useTranslation(['users', 'projects', 'common'])

  useEffect(() => {
    if (!loading && user === null) {
      router.push('/')
    }
  }, [router, user, loading])

  return (
    <div className="container">
      {user?.id && (
        <div className="divide-y divide-darkBlue">
          <div className="grid grid-cols-3 gap-7 md:grid-cols-4 xl:grid-cols-6 lg:mt-15 mt-12 h5 lg:text-lg font-bold text-center">
            {[
              { type: 'account', label: 'Account', class: 'tab' },
              {
                type: 'projects',
                label: 'projects:Projects',
                class: 'tab',
              },
              {
                type: 'create',
                label: 'projects:CreateProject',
                class: 'tab bg-white',
              },
            ]
              .filter((el) => (user?.is_admin ? el : el.type !== 'create'))
              .map((el) => (
                <button
                  key={el.type}
                  disabled={type === el.type}
                  onClick={() => setType(el.type)}
                  className={type === el.type ? 'tab-active' : el.class}
                >
                  {t(el.label)}
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
