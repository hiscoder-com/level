import { Fragment, useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import { Menu, Tab } from '@headlessui/react'

import ProjectCreate from './ProjectCreate'
import Projects from './Projects'
import MobileMenu from './Panel/UI/MobileMenu'

import { useCurrentUser } from 'lib/UserContext'

import Plus from 'public/plus.svg'

const sizeTabs = {
  1: 'w-1/6',
  2: 'w-full lg:w-3/6',
  3: 'w-full lg:w-4/6 ',
  4: 'w-4/6',
  5: 'w-5/6',
  6: 'w-full',
}

function Account() {
  const { user, loading } = useCurrentUser()
  const router = useRouter()
  const [openInternalMenu, setOpenInternalMenu] = useState(false)

  const { t } = useTranslation(['users', 'project-edit'])

  useEffect(() => {
    if (!loading && user === null) {
      router.push('/')
    }
  }, [router, user, loading])
  const tabs = ['Account', 'projects:Projects', 'projects:CreateProject']
  return (
    <>
      <div className="mx-auto max-w-7xl">
        {user?.id && (
          <>
            <Tab.Group as="div" className="block sm:hidden">
              <Tab.List className="flex p-1 w-full bg-th-secondary-10 border border-th-secondary-300 rounded-3xl shadow-md">
                {tabs
                  .filter((el) => el !== 'projects:CreateProject')
                  .map((tab) => (
                    <Tab as={Fragment} key={tab}>
                      {({ selected }) => (
                        <div
                          className={`p-2 w-full text-center rounded-3xl cursor-pointer ${
                            selected ? 'bg-th-primary-100 text-th-text-secondary-100' : ''
                          }
                      `}
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
            <Tab.Group as="div" className="hidden sm:block">
              <Tab.List
                className={`flex px-5 ${
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
                          `flex-1 ${selected ? 'tab-active' : 'tab-inactive'}`
                        }
                      >
                        {t(tab)}
                      </Tab>
                    )
                )}
              </Tab.List>
              <Tab.Panels className="pb-10">
                <div className="px-10 h-10 bg-th-primary-500 rounded-t-3xl"></div>
                <div className="px-5 border border-th-secondary-300 bg-th-secondary-10 rounded-b-2xl">
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
      {user?.is_admin && (
        <MobileMenu
          onClose={() => setOpenInternalMenu(false)}
          hideCloseButton={openInternalMenu}
          btnPositionHeight="bottom-[15vh]"
          mainHeight="h-[15vh]"
        >
          <Menu.Items>
            <Menu.Item as="div" className="flex justify-center items-center h-[15vh]">
              <Menu>
                <Menu.Button>
                  <div
                    className={`py-2 px-7 text-th-text-secondary-100 cursor-pointer bg-th-primary-100 rounded-3xl ${
                      openInternalMenu ? 'hidden' : 'block'
                    }`}
                    onClick={() => setOpenInternalMenu(true)}
                  >
                    {t('project-edit:CreateNewProject')}
                  </div>
                </Menu.Button>
              </Menu>
            </Menu.Item>
          </Menu.Items>
        </MobileMenu>
      )}

      {openInternalMenu && (
        <div className="fixed inset-0 px-5 pb-4 mt-14 min-h-screen z-20 overflow-y-scroll bg-th-secondary-10">
          <div className="flex justify-end -mb-7">
            <button
              className="p-4 mt-4 rounded-full shadow-2xl text-th-text-secondary-100 bg-th-primary-100"
              onClick={() => setOpenInternalMenu(false)}
            >
              <Plus className="w-7 h-7 rotate-45" />
            </button>
          </div>
          <ProjectCreate />
        </div>
      )}
    </>
  )
}

export default Account
