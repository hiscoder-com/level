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
          <div className="grid grid-cols-3 gap-7  md:grid-cols-3 xl:grid-cols-5 md:mt-24 mt-12 md:text-xl font-bold text-center">
            {[
              { type: 'account', label: 'Account' },
              { type: 'projects', label: 'projects:Projects' },
              { type: 'create', label: 'projects:CreateProject' },
            ]
              .filter((el) => (user?.is_admin ? el : el.type !== 'create'))
              .map((el) => (
                <button
                  key={el.type}
                  disabled={type === el.type}
                  onClick={() => setType(el.type)}
                  className={type === el.type ? 'tab-active' : 'tab cursor-pointer'}
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
