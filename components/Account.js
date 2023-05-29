import { Fragment, useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import { Menu, Tab, Transition } from '@headlessui/react'

import ProjectCreate from './ProjectCreate'
import Projects from './Projects'

import { useCurrentUser } from 'lib/UserContext'

import Plus from 'public/plus.svg'

function Account() {
  const { user, loading } = useCurrentUser()
  const router = useRouter()
  const [openInternalMenu, setOpenInternalMenu] = useState(false)

  const { t } = useTranslation(['users'])

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
              <Tab.List className="flex p-1 w-full bg-white border border-gray-350 rounded-3xl shadow-md">
                {tabs
                  .filter((el) => el !== 'projects:CreateProject')
                  .map((tab) => (
                    <Tab as={Fragment} key={tab}>
                      {({ selected }) => (
                        <div
                          className={`p-2 w-full rounded-3xl text-center cursor-pointer ${
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

              <Tab.Panels>
                <Tab.Panel>
                  <Projects type={'account'} />
                </Tab.Panel>
                <Tab.Panel>
                  <Projects type={'projects'} />
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>

            <Tab.Group as="div" className="sm:block hidden">
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
      <Menu>
        {({ open }) => (
          <>
            <div
              className={`inset-0 bg-gray-300 bg-opacity-25 backdrop-filter backdrop-blur ${
                open ? 'fixed' : 'hidden'
              }`}
              onClick={() => setOpenInternalMenu(false)}
            ></div>
            <Menu.Button
              className={`fixed sm:hidden translate-y-1/2 right-10 z-50 rounded-full bg-slate-600 text-white p-4 transition-all duration-700 shadow-2xl ${
                openInternalMenu ? 'bottom-[50vh]' : 'bottom-[15vh]'
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
                  openInternalMenu ? 'bg-inherit' : 'bg-white'
                }`}
              >
                <Menu.Item as="div" className="flex flex-col justify-center items-center">
                  <Menu>
                    {({ open: openInternal }) => (
                      <>
                        <Menu.Button>
                          <div
                            className={`rounded-3xl py-2 px-7 text-center cursor-pointer bg-slate-600 text-white ${
                              openInternalMenu ? 'hidden' : 'block'
                            }`}
                            onClick={() => setOpenInternalMenu(true)}
                          >
                            {t('NewProject')}
                          </div>
                        </Menu.Button>
                        <Transition
                          as={Fragment}
                          show={openInternal}
                          enter="transition-all duration-700 ease-in-out transform"
                          enterFrom="translate-y-full"
                          enterTo="translate-y-0"
                          leave="transition-all duration-700 ease-in-out transform"
                          leaveFrom="translate-y-0"
                          leaveTo="translate-y-full"
                        >
                          <Menu.Items>
                            <div className="h-[50vh] overflow-y-scroll">
                              <ProjectCreate />
                            </div>
                          </Menu.Items>
                        </Transition>
                      </>
                    )}
                  </Menu>
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
    </>
  )
}

export default Account
