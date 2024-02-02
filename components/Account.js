import { Fragment, useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import { Disclosure, Menu, Tab, Transition } from '@headlessui/react'

import ProjectCreate from './ProjectCreate'
import Projects from './Projects'

import { useCurrentUser } from 'lib/UserContext'

import Threedots from 'public/threedots.svg'
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

  const isSupportAccess = true //TODO сделать проверку на support, желательно на уровне сервера
  const { t } = useTranslation(['users', 'project-edit'])
  useEffect(() => {
    if (!loading && user === null) {
      router.push('/')
    }
  }, [router, user, loading])
  const tabs = useMemo(() => {
    const defaultTabs = ['Account', 'projects:Projects']
    const isAdmin = user?.is_admin
    if (isAdmin) {
      return defaultTabs.concat('Support', 'projects:CreateProject')
    } else if (isSupportAccess) {
      return defaultTabs.concat('Support')
    } else {
      return defaultTabs
    }
  }, [isSupportAccess, user?.is_admin])
  return (
    <>
      <div className="mx-auto max-w-7xl">
        {user?.id && (
          <>
            <Tab.Group as="div" className="block sm:hidden">
              <Tab.List className="flex p-1 w-full bg-th-secondary-10 border border-th-secondary-300 rounded-3xl shadow-md">
                {['Account', 'projects:Projects'].map((tab) => (
                  <Tab as={Fragment} key={tab}>
                    {({ selected }) => (
                      <div
                        className={`p-2 w-full text-center rounded-3xl cursor-pointer ${
                          selected ? 'bg-th-primary-100 text-th-text-secondary-100' : ''
                        }`}
                      >
                        {t(tab)}
                      </div>
                    )}
                  </Tab>
                ))}
              </Tab.List>
              {(user?.is_admin || isSupportAccess) && (
                <Disclosure as="div" className="relative flex flex-col items-center mt-2">
                  <Disclosure.Button>
                    <Threedots className="w-8" />
                  </Disclosure.Button>
                  <Disclosure.Panel className="flex mt-2 p-1 w-full bg-th-secondary-10 border border-th-secondary-300 rounded-3xl shadow-md">
                    {['Support', 'projects:CreateProject']
                      .filter((tab) => user?.is_admin || tab !== 'projects:CreateProject')
                      .map((tab) => (
                        <Tab as={Fragment} key={tab}>
                          {({ selected }) => (
                            <div
                              className={`p-2 w-full text-center rounded-3xl cursor-pointer ${
                                selected ? 'bg-th-primary-200 text-th-text-secondary' : ''
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
                {(user?.is_admin || isSupportAccess) && (
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
              <Tab.List
                className={`flex px-5 ${
                  sizeTabs[tabs.length]
                } gap-4 mt-2 text-center font-bold`}
              >
                {tabs.map((tab) => (
                  <Tab
                    key={tab}
                    className={({ selected }) =>
                      `flex-1 ${selected ? 'tab-active' : 'tab-inactive'}`
                    }
                  >
                    {t(tab)}
                  </Tab>
                ))}
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
                    <Projects type={'support'} />
                  </Tab.Panel>
                  <Tab.Panel>{user?.is_admin && <ProjectCreate />}</Tab.Panel>
                </div>
              </Tab.Panels>
            </Tab.Group>
          </>
        )}

        {user?.is_admin && (
          <Menu>
            {({ open }) => (
              <>
                <div
                  className={`inset-0 bg-th-secondary-100 bg-opacity-25 backdrop-filter backdrop-blur ${
                    open ? 'fixed' : 'hidden'
                  }`}
                ></div>
                <Menu.Button
                  className={`block sm:hidden p-4 translate-y-1/2 right-5 text-th-text-secondary-100 rounded-full bg-th-primary-100 transition-all duration-700 shadow-2xl bottom-[15vh] ${
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
                      openInternalMenu ? 'bg-inherit' : 'bg-th-secondary-10'
                    }`}
                  >
                    <Menu.Item
                      as="div"
                      className="flex flex-col justify-center items-center"
                    >
                      <Menu>
                        <Menu.Button>
                          <div
                            className={`py-2 px-7 text-center text-th-text-secondary-100 cursor-pointer bg-th-primary-100 rounded-3xl ${
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
          inset-0 min-h-screen overflow-y-scroll bg-th-secondary-10"
          >
            <div className="flex justify-end">
              <button
                className={`p-4 mt-4 text-th-text-secondary-100 rounded-full bg-th-primary-100 shadow-2xl ${
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
      </div>
    </>
  )
}

export default Account
