import { Fragment, useEffect } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import { Disclosure, Tab } from '@headlessui/react'

import ProjectCreate from './ProjectCreate'
import Projects from './Projects'

import { useCurrentUser } from 'lib/UserContext'

import Threedots from 'public/threedots.svg'

const sizeTabs = {
  1: 'w-1/6',
  2: 'w-2/6',
  3: 'w-3/6',
  4: 'w-4/6',
  5: 'w-5/6',
  6: 'w-full',
}

function Account({ isSupporter }) {
  const { user, loading } = useCurrentUser()
  const router = useRouter()

  const { t } = useTranslation(['users', 'project-edit'])

  useEffect(() => {
    if (!loading && user === null) {
      router.push('/')
    }
  }, [router, user, loading])

  const tabs = ['Account', 'projects:Projects', 'Support', 'projects:CreateProject']
  return (
    <>
      <div className="mx-auto max-w-7xl">
        {user?.id && (
          <>
            <Tab.Group as="div" className="block sm:hidden">
              <Tab.List className="flex p-1 w-full bg-white border border-gray-350 rounded-3xl shadow-md">
                {['Account', 'projects:Projects'].map((tab) => (
                  <Tab as={Fragment} key={tab}>
                    {({ selected }) => (
                      <div
                        className={`p-2 w-full text-center rounded-3xl cursor-pointer ${
                          selected ? 'bg-slate-600 text-white' : ''
                        }
                      `}
                      >
                        {t(tab)}
                      </div>
                    )}
                  </Tab>
                ))}
              </Tab.List>
              {(user?.is_admin || isSupporter) && (
                <Disclosure as="div" className="relative flex flex-col items-center mt-2">
                  <Disclosure.Button>
                    <Threedots className="w-8" />
                  </Disclosure.Button>

                  <Disclosure.Panel className="mt-2 flex p-1 w-full bg-white border border-gray-350 rounded-3xl shadow-md">
                    {['Support', 'projects:CreateProject']
                      .filter((tab) => user?.is_admin || tab !== 'projects:CreateProject')
                      .map((tab) => (
                        <Tab as={Fragment} key={tab}>
                          {({ selected }) => (
                            <div
                              className={`p-2 w-full text-center rounded-3xl cursor-pointer ${
                                selected ? 'bg-slate-600 text-white' : ''
                              }
                      `}
                            >
                              {t(tab)}
                            </div>
                          )}
                        </Tab>
                      ))}
                  </Disclosure.Panel>
                </Disclosure>
              )}

              <Tab.Panels>
                <Tab.Panel>
                  <Projects type={'account'} />
                </Tab.Panel>
                <Tab.Panel>
                  <Projects type={'projects'} />
                </Tab.Panel>
                {(user?.is_admin || isSupporter) && (
                  <Tab.Panel>
                    <Projects type={'support'} />
                  </Tab.Panel>
                )}
                <Tab.Panel>
                  {user?.is_admin && (
                    <div
                      className="card px-5 pb-4 mt-10
           overflow-y-scroll"
                    >
                      <ProjectCreate />
                    </div>
                  )}
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>

            <Tab.Group as="div" className="hidden sm:block">
              <div className="border-b border-slate-600">
                <Tab.List
                  className={`flex ${
                    sizeTabs[
                      tabs.filter(
                        (tab) =>
                          (user?.is_admin && tab === 'projects:CreateProject') ||
                          tab !== 'projects:CreateProject'
                      ).length
                    ]
                  } gap-4 mt-2 text-center font-bold`}
                >
                  {tabs.map(
                    (tab) =>
                      ((user?.is_admin && tab === 'projects:CreateProject') ||
                        tab !== 'projects:CreateProject') && (
                        <Tab
                          key={tab}
                          className={({ selected }) =>
                            `flex-1 ${selected ? 'tab-active ' : 'tab'}`
                          }
                        >
                          {t(tab)}
                        </Tab>
                      )
                  )}
                </Tab.List>
              </div>

              <Tab.Panels>
                <Tab.Panel>
                  <Projects type={'account'} />
                </Tab.Panel>
                <Tab.Panel>
                  <Projects type={'projects'} />
                </Tab.Panel>
                <Tab.Panel>
                  <Projects type={'support'} />
                </Tab.Panel>
                <Tab.Panel>{user?.is_admin && <ProjectCreate />}</Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </>
        )}
      </div>
    </>
  )
}

export default Account
