import { useEffect } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import { Tab } from '@headlessui/react'

import ProjectCreate from './ProjectCreate'
import Projects from './Projects'

import { useCurrentUser } from 'lib/UserContext'

function Account() {
  const { user, loading } = useCurrentUser()
  const router = useRouter()

  const { t } = useTranslation(['users'])

  useEffect(() => {
    if (!loading && user === null) {
      router.push('/')
    }
  }, [router, user, loading])
  const tabs = ['Account', 'projects:Projects', 'projects:CreateProject']
  return (
    <div className="mx-auto max-w-7xl">
      {user?.id && (
        <Tab.Group>
          <Tab.List className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-7 mt-2 text-base lg:text-lg font-bold text-center border-b border-darkBlue">
            {tabs.map(
              (tab) =>
                ((user?.is_admin && tab === 'projects:CreateProject') ||
                  tab !== 'projects:CreateProject') && (
                  <Tab
                    key={tab}
                    className={({ selected }) => (selected ? 'tab-active' : 'tab')}
                  >
                    {t(tab)}
                  </Tab>
                )
            )}
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel>
              <Projects type={'account'} />
            </Tab.Panel>
            <Tab.Panel>
              <Projects type={'projects'} />
            </Tab.Panel>
            <Tab.Panel>
              <ProjectCreate />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      )}
    </div>
  )
}

export default Account
