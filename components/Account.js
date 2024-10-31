import { Fragment, useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { Menu, Tab } from '@headlessui/react'
import { useTranslation } from 'next-i18next'

import ProjectCreate from './ProjectCreate'
import Projects from './Projects'

import { useCurrentUser } from 'lib/UserContext'

const sizeTabs = {
  1: 'w-1/6',
  2: 'w-full lg:w-3/6',
  3: 'w-full lg:w-4/6 ',
  4: 'w-4/6',
  5: 'w-5/6',
  6: 'w-full',
}

function Account() {
  const [selectedTab, setSelectedTab] = useState(0)
  const { user, loading } = useCurrentUser()
  const router = useRouter()

  const { t } = useTranslation(['users', 'project-edit'])

  useEffect(() => {
    if (!loading && user === null) {
      router.push('/')
    }
  }, [router, user, loading])

  useEffect(() => {
    if (router.query?.tab) {
      setSelectedTab(parseInt(router.query?.tab))
    }
  }, [router])

  useEffect(() => {
    router.push(`?tab=${selectedTab}`, undefined, { shallow: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTab])

  const tabs = ['Account', 'projects:Projects', 'projects:CreateProject']
  return (
    <>
      <div className="mx-auto max-w-7xl">
        {user?.id && (
          <>
            <Tab.Group
              as="div"
              className="block sm:hidden"
              selectedIndex={selectedTab}
              onChange={setSelectedTab}
            >
              <Tab.List className="flex w-full rounded-3xl border border-th-secondary-300 bg-th-secondary-10 p-1 shadow-md">
                {tabs
                  .filter((el) => el !== 'projects:CreateProject')
                  .map((tab) => (
                    <Tab as={Fragment} key={tab}>
                      {({ selected }) => (
                        <div
                          className={`w-full cursor-pointer rounded-3xl p-2 text-center ${
                            selected ? 'bg-th-primary-100 text-th-text-secondary-100' : ''
                          } `}
                        >
                          {t(tab)}
                        </div>
                      )}
                    </Tab>
                  ))}
              </Tab.List>

              <Tab.Panels>
                <Tab.Panel>
                  <Projects type={'account'} />
                </Tab.Panel>
                <Tab.Panel>
                  <Projects type={'projects'} />
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
            <Tab.Group
              as="div"
              className="hidden sm:block"
              selectedIndex={selectedTab}
              onChange={setSelectedTab}
            >
              <Tab.List
                className={`flex px-5 ${
                  sizeTabs[
                    tabs.filter(
                      (tab) =>
                        (user?.is_admin && tab === 'projects:CreateProject') ||
                        tab !== 'projects:CreateProject'
                    ).length
                  ]
                } mt-2 gap-4 text-center font-bold`}
              >
                {tabs.map(
                  (tab) =>
                    ((user?.is_admin && tab === 'projects:CreateProject') ||
                      tab !== 'projects:CreateProject') && (
                      <Tab
                        key={tab}
                        className={({ selected }) =>
                          `flex-1 ${selected ? 'tab-active' : 'tab-inactive'}`
                        }
                      >
                        {t(tab)}
                      </Tab>
                    )
                )}
              </Tab.List>
              <Tab.Panels className="pb-10">
                <div className="h-10 rounded-t-3xl bg-th-primary-500 px-10"></div>
                <div className="rounded-b-2xl border border-th-secondary-300 bg-th-secondary-10 px-5">
                  <Tab.Panel>
                    <Projects type={'account'} />
                  </Tab.Panel>
                  <Tab.Panel>
                    <Projects type={'projects'} />
                  </Tab.Panel>
                  <Tab.Panel>
                    <ProjectCreate />
                  </Tab.Panel>
                </div>
              </Tab.Panels>
            </Tab.Group>
          </>
        )}
      </div>
    </>
  )
}

export default Account
