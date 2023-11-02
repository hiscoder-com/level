import { Fragment, useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import { Menu, Tab, Transition } from '@headlessui/react'

import ProjectCreate from './ProjectCreate'
import Projects from './Projects'

import { useCurrentUser } from 'lib/UserContext'

import Plus from 'public/plus.svg'

const sizeTabs = {
  1: 'w-1/6',
  2: 'w-2/6',
  3: 'w-3/6',
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
              <Tab.List className="flex p-1 w-full bg-th-background-secondary border border-th-border-secondary rounded-3xl shadow-md">
                {tabs
                  .filter((el) => el !== 'projects:CreateProject')
                  .map((tab) => (
                    <Tab as={Fragment} key={tab}>
                      {({ selected }) => (
                        <div
                          className={`p-2 w-full text-center rounded-3xl cursor-pointer ${
                            selected
                              ? 'bg-th-primary text-th-text-secondary'
                              : 'bg-gradient-to-b from-th-background-secondary to-th-background-primary'
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
                <div className="bg-th-primary h-10 rounded-t-3xl px-10"></div>
                <div className="bg-th-background-secondary px-10 border border-th-border-secondary rounded-b-2xl">
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
        <Menu>
          {({ open }) => (
            <>
              <div
                className={`inset-0 bg-th-background-primary bg-opacity-25 backdrop-filter backdrop-blur ${
                  open ? 'fixed' : 'hidden'
                }`}
              ></div>
              <Menu.Button
                className={`block md:hidden p-4 translate-y-1/2 right-5 text-th-text-secondary rounded-full bg-th-primary transition-all duration-700 shadow-2xl bottom-[15vh] ${
                  openInternalMenu ? 'hidden' : 'fixed'
                }`}
                onClick={() => setOpenInternalMenu(false)}
              >
                <Plus
                  className={`w-7 h-7 transition-all duration-700 ${
                    open ? 'rotate-45' : 'rotate-0'
                  }`}
                />
              </Menu.Button>
              <Transition
                as={Fragment}
                show={open}
                enter="transition-all duration-700 ease-in-out transform"
                enterFrom="translate-y-full"
                enterTo="translate-y-0"
                leave="transition-all duration-700 ease-in-out transform"
                leaveFrom="translate-y-0"
                leaveTo="translate-y-full"
              >
                <Menu.Items
                  className={`fixed flex justify-center bottom-0 left-0 w-full min-h-[15vh] overflow-y-auto rounded-t-2xl shadow-md ${
                    openInternalMenu ? 'bg-inherit' : 'bg-th-background-secondary'
                  }`}
                >
                  <Menu.Item
                    as="div"
                    className="flex flex-col justify-center items-center"
                  >
                    <Menu>
                      <Menu.Button>
                        <div
                          className={`py-2 px-7 text-center text-th-text-secondary cursor-pointer bg-th-primary rounded-3xl ${
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
              </Transition>
            </>
          )}
        </Menu>
      )}
      {openInternalMenu && (
        <div
          className="fixed px-5 pb-4 mt-14
          inset-0 min-h-screen overflow-y-scroll bg-white"
        >
          <div className="flex justify-end">
            <button
              className={`p-4 mt-4 text-th-text-secondary rounded-full bg-th-primary shadow-2xl ${
                openInternalMenu ? 'block' : 'hidden'
              }`}
              onClick={() => setOpenInternalMenu(false)}
            >
              <Plus
                className={`w-7 h-7 transition-all duration-700 ${
                  open || openInternalMenu ? 'rotate-45' : 'rotate-0'
                }`}
              />
            </button>
          </div>
          <ProjectCreate />
        </div>
      )}
    </>
  )
}

export default Account
