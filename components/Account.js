import { Fragment, useEffect } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import { Tab } from '@headlessui/react'

import ProjectCreate from './ProjectCreate'
import Projects from './Projects'

import { useCurrentUser } from 'lib/UserContext'

import Plus from 'public/plus.svg'

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
        <>
          <Tab.Group as={'div'} className="block sm:hidden">
            <Tab.List className="flex p-1 w-full bg-white border border-gray-350 rounded-3xl shadow-md">
              {tabs
                .filter((el) => el !== 'projects:CreateProject')
                .map((tab) => (
                  <Tab as={Fragment} key={tab}>
                    {({ selected }) => (
                      <div
                        className={`w-full rounded-3xl p-2 text-center cursor-pointer ${
                          selected ? 'bg-slate-600 text-white' : ''
                        }
                      `}
                      >
                        {t(tab)}
                      </div>
                    )}
                  </Tab>
                ))}

              <Tab>
                {({ selected }) => (
                  <div
                    className={`${
                      selected ? 'hidden' : 'fixed'
                    } right-[5vh] bottom-[20vh] w-fit p-6 rounded-full bg-slate-600 shadow-md`}
                  >
                    <Plus className="w-6 h-6 stroke-white" />
                  </div>
                )}
              </Tab>
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
          <Tab.Group as={'div'} className="sm:block hidden">
            <Tab.List className="grid grid-cols-3 md:grid-cols-8 xl:grid-cols-9 gap-4 mt-2 text-center font-bold border-b border-slate-600">
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
        </>
      )}
    </div>
  )
}

export default Account
