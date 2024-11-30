import { Fragment, useCallback, useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import { Menu, Transition } from '@headlessui/react'
import { useTranslation } from 'next-i18next'
import { useRecoilState } from 'recoil'

import AboutVersion from 'components/AboutVersion'

import AboutProject from './AboutProject'
import AvatarSelector from './AvatarSelector'
import ModalInSideBar from './ModalInSideBar'
import { PersonalNotes } from './Panel'
import ProjectCreate from './ProjectCreate'
import SignOut from './SignOut'
import Feedback from './StartPage/Feedback'
import { modalsSidebar } from './state/atoms'
import SwitchLocalization from './SwitchLocalization'
import ThemeSwitcher from './ThemeSwitcher'
import TranslatorImage from './TranslatorImage'

import { useCurrentUser } from 'lib/UserContext'

import About from 'public/icons/about.svg'
import Account from 'public/icons/account.svg'
import Burger from 'public/icons/burger.svg'
import Camera from 'public/icons/camera.svg'
import Close from 'public/icons/close.svg'
import CreateProject from 'public/icons/create-project.svg'
import Localization from 'public/icons/localization.svg'
import Notes from 'public/icons/notes.svg'
import Projects from 'public/icons/projects.svg'
import Users from 'public/icons/users.svg'
import VersionLogo from 'public/icons/version.svg'
import WriteToUs from 'public/icons/write_to_us.svg'

const activeIconClass =
  'stroke-th-text-primary lg:stroke-th-secondary-300 group-hover:stroke-th-text-primary'
const activeTextClass =
  'text-th-text-primary lg:text-th-secondary-300 group-hover:text-th-text-primary'

function SideBar({ setIsOpenSideBar, access, isOpenSideBar }) {
  const { user } = useCurrentUser()
  const { t } = useTranslation(['common', 'projects', 'users', 'start-page'])
  const [modalsSidebarState, setModalsSidebarState] = useRecoilState(modalsSidebar)

  const [collapsed, setCollapsed] = useState(true)
  const [isLargeScreen, setIsLargeScreen] = useState(false)
  const [showCreate, setShowCreate] = useState(false)

  const collapsedSideBar = collapsed ? 'lg:hidden' : ''

  const router = useRouter()

  const openModal = (modalType) => {
    setModalsSidebarState((prevModals) => {
      const newModals = {
        aboutVersion: false,
        avatarSelector: false,
        notepad: false,
        writeToUs: false,
        about: false,
      }

      newModals[modalType] = !prevModals[modalType]

      return newModals
    })
  }

  const closeModal = useCallback(() => {
    setModalsSidebarState({
      aboutVersion: false,
      avatarSelector: false,
      notepad: false,
      writeToUs: false,
      about: false,
    })
  }, [setModalsSidebarState])

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth > 1024)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)

    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  useEffect(() => {
    if (!isOpenSideBar) {
      setCollapsed(true)
      closeModal()
    }
  }, [closeModal, isOpenSideBar])
  const clear = (close) => {
    closeModal()
    setIsOpenSideBar(false)
    close && close()
  }

  return (
    <Menu>
      {({ open, close }) => (
        <>
          <Menu.Button
            onClick={() => {
              closeModal()
              setIsOpenSideBar((prev) => !prev)
            }}
            className="z-20"
          >
            {access &&
              (!open ? (
                <Burger className="h-10 stroke-th-text-secondary-100 lg:hidden" />
              ) : (
                <Close className="h-10 stroke-th-text-secondary-100 lg:hidden" />
              ))}
          </Menu.Button>
          <Transition
            afterLeave={() => {
              setShowCreate(false)
            }}
            as={Fragment}
            appear={open}
            show={isLargeScreen || open}
            enter="transition-opacity duration-200"
            leave="transition-opacity duration-200"
          >
            <Menu.Items
              className={`fixed top-14 z-20 -mx-5 flex h-[calc(100vh-52px)] w-full cursor-default flex-col gap-7 transition-all duration-150 sm:top-20 sm:px-5 md:w-1/2 md:pr-3 lg:left-0 lg:top-16 lg:h-[calc(100vh-64px)] ${
                !collapsed ? 'lg:w-56' : 'lg:ml-0 lg:w-[3.25rem] lg:p-0 2xl:mx-0'
              }`}
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={() => {
                setCollapsed(false)

                setIsOpenSideBar(true)
              }}
              onMouseLeave={() => {
                if (
                  modalsSidebarState.notepad ||
                  modalsSidebarState.aboutVersion ||
                  modalsSidebarState.avatarSelector ||
                  modalsSidebarState.writeToUs ||
                  modalsSidebarState.about
                ) {
                  return
                }
                setCollapsed(true)
                closeModal()
                close()
                setIsOpenSideBar(false)
              }}
            >
              <div className="relative flex h-full cursor-default flex-col gap-2 border border-th-secondary-300 bg-th-secondary-10 shadow-md sm:rounded-2xl lg:h-screen lg:rounded-none">
                <div
                  className={`flex cursor-default items-center gap-2 overflow-hidden border-b border-th-secondary-300 px-4 py-4 lg:flex-col lg:items-start lg:border-b-0 ${
                    collapsed ? 'lg:w-0 lg:px-0' : 'lg:w-full'
                  }`}
                >
                  <div
                    className="group relative h-16 w-16 min-w-[3rem] rounded-full shadow-lg"
                    onClick={() => openModal('avatarSelector')}
                  >
                    <TranslatorImage item={{ users: user }} isPointerCursor="true" />
                    <div className="absolute start-0 top-0 h-full w-full overflow-hidden rounded-full">
                      <div className="absolute bottom-0 left-0 flex h-1/3 w-full cursor-pointer items-center justify-center bg-black opacity-70 transition-opacity duration-500 group-hover:opacity-70 md:opacity-0">
                        <Camera className="w-4 text-white" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-2xl font-bold lg:text-base lg:font-medium">
                      {user?.login}
                    </div>
                    <div className="lg:text-xs">{user?.email}</div>
                  </div>
                </div>

                <div className="f-screen-appbar flex grow flex-col justify-between sm:min-h-[60vh]">
                  <div className="flex grow flex-col justify-between gap-8 text-sm">
                    <div className="flex flex-col">
                      <Menu.Item
                        as="div"
                        disabled
                        className={`group px-4 py-3 ${
                          router.query?.tab !== '0' ? 'opacity-70' : 'bg-th-secondary-200'
                        } hover:bg-th-secondary-200`}
                      >
                        <Link href="/account?tab=0" legacyBehavior>
                          <a
                            className="flex cursor-pointer items-center gap-2"
                            onClick={() => {
                              closeModal()
                              setIsOpenSideBar(false)
                              close()
                            }}
                          >
                            <div className="rounded-[23rem]">
                              <Account
                                className={`ml-0.5 w-4 ${
                                  router.query?.tab === '0'
                                    ? 'stroke-th-text-primary'
                                    : activeIconClass
                                }`}
                              />
                            </div>
                            <span
                              className={`whitespace-nowrap ${collapsedSideBar} ${
                                router.query?.tab === '0'
                                  ? 'text-th-text-primary'
                                  : activeTextClass
                              }`}
                            >
                              {t('Account')}
                            </span>
                          </a>
                        </Link>
                      </Menu.Item>
                      <Menu.Item
                        as="div"
                        disabled
                        className={`group px-4 py-3 ${
                          router.query?.tab !== '1' ? 'opacity-70' : 'bg-th-secondary-200'
                        } hover:bg-th-secondary-200`}
                      >
                        <Link href="/account?tab=1" legacyBehavior>
                          <a
                            className="flex cursor-pointer items-center gap-2"
                            onClick={() => {
                              closeModal()
                              setIsOpenSideBar(false)
                              close()
                            }}
                          >
                            <div className="rounded-[23rem]">
                              <Projects
                                className={`w-5 ${
                                  router.query?.tab === '1'
                                    ? 'stroke-th-text-primary'
                                    : activeIconClass
                                }`}
                              />
                            </div>
                            <span
                              className={`${collapsedSideBar} ${
                                router.query?.tab === '1'
                                  ? 'text-th-text-primary'
                                  : activeTextClass
                              }`}
                            >
                              {t('Projects')}
                            </span>
                          </a>
                        </Link>
                      </Menu.Item>
                      {user?.is_admin && (
                        <Menu.Item
                          as="div"
                          disabled
                          className={`group hidden px-4 py-3 md:block ${
                            router.query?.tab !== '2'
                              ? 'opacity-70'
                              : 'bg-th-secondary-200'
                          } hover:bg-th-secondary-200`}
                        >
                          <Link href="/account?tab=2" legacyBehavior>
                            <a
                              className="flex cursor-pointer items-center gap-2"
                              onClick={() => {
                                closeModal()
                                setIsOpenSideBar(false)
                                close()
                              }}
                            >
                              <div className="rounded-[23rem]">
                                <CreateProject
                                  className={`h-5 w-5 ${
                                    router.query?.tab === '2'
                                      ? 'stroke-th-text-primary'
                                      : activeIconClass
                                  }`}
                                />
                              </div>
                              <div
                                className={`overflow-hidden ${
                                  collapsed
                                    ? 'lg:w-0'
                                    : 'transition-all delay-700 duration-700 lg:w-auto'
                                }`}
                              >
                                <span
                                  className={`whitespace-nowrap ${collapsedSideBar} ${
                                    router.query?.tab === '2'
                                      ? 'text-th-text-primary'
                                      : activeTextClass
                                  }`}
                                >
                                  {t('CreateProject')}
                                </span>
                              </div>
                            </a>
                          </Link>
                        </Menu.Item>
                      )}

                      {user?.is_admin && (
                        <Menu.Item
                          as="div"
                          disabled
                          className={`flex cursor-default items-center justify-between gap-2 px-4 md:hidden ${
                            !showCreate ? 'opacity-70' : ''
                          }`}
                        >
                          <div
                            className="flex w-full cursor-pointer items-center gap-2 py-3"
                            onClick={() => {
                              setShowCreate((prev) => !prev)
                              openModal()
                            }}
                          >
                            <div className="rounded-[23rem] hover:opacity-70">
                              <CreateProject
                                className={`h-5 w-5 ${
                                  showCreate ? 'stroke-th-text-primary' : activeIconClass
                                }`}
                              />
                            </div>
                            <ModalInSideBar
                              setIsOpen={setShowCreate}
                              isOpen={showCreate}
                              buttonTitle={t('CreateProject')}
                              modalTitle={t('CreateProject')}
                              collapsed={collapsed}
                            >
                              <ProjectCreate />
                            </ModalInSideBar>
                          </div>
                        </Menu.Item>
                      )}

                      <Menu.Item
                        as="div"
                        disabled
                        className={`group flex cursor-default items-center justify-between gap-2 px-4 ${
                          modalsSidebarState.notepad
                            ? 'bg-th-secondary-200'
                            : 'opacity-70'
                        } hover:bg-th-secondary-200`}
                      >
                        <div
                          className="flex w-full cursor-pointer items-center gap-2 py-3"
                          onClick={() => {
                            openModal('notepad')
                          }}
                        >
                          <div className="rounded-[23rem]">
                            <Notes
                              className={`h-5 w-5 ${
                                modalsSidebarState.notepad
                                  ? 'stroke-th-text-primary'
                                  : 'text-th-text-primary group-hover:text-th-text-primary lg:text-th-secondary-300'
                              }`}
                            />
                          </div>
                          <ModalInSideBar
                            isOpen={modalsSidebarState.notepad}
                            setIsOpen={(value) => {
                              setModalsSidebarState((prev) => ({
                                ...prev,
                                notepad: value,
                              }))
                              setCollapsed(!value)
                              setIsOpenSideBar(value)
                            }}
                            modalTitle={t('personalNotes')}
                            buttonTitle={t('personalNotes')}
                            collapsed={collapsed}
                          >
                            <PersonalNotes />
                          </ModalInSideBar>
                        </div>
                      </Menu.Item>

                      {user?.is_admin && (
                        <Menu.Item
                          as="div"
                          disabled
                          className={`group px-4 ${
                            router.pathname === '/users'
                              ? 'bg-th-secondary-200'
                              : 'opacity-70'
                          } hover:bg-th-secondary-200`}
                        >
                          <Link href="/users" legacyBehavior>
                            <a
                              className="flex cursor-pointer items-center gap-2 py-3"
                              onClick={() => {
                                closeModal()
                                setIsOpenSideBar(false)
                                close()
                              }}
                            >
                              <div className="rounded-[23rem]">
                                <Users
                                  className={`w-5 ${
                                    router.pathname === '/users'
                                      ? 'stroke-th-text-primary'
                                      : activeIconClass
                                  }`}
                                />
                              </div>
                              <div
                                className={`overflow-hidden ${
                                  collapsed ? 'lg:w-0' : 'lg:w-auto'
                                }`}
                              >
                                <span
                                  className={`whitespace-nowrap ${collapsedSideBar} ${
                                    router.pathname === '/users'
                                      ? 'text-th-text-primary'
                                      : activeTextClass
                                  }`}
                                >
                                  {t('users:UserManagement')}
                                </span>
                              </div>
                            </a>
                          </Link>
                        </Menu.Item>
                      )}
                      <div className="mt-2 space-y-2">
                        <div className="h-px w-full bg-th-secondary-100" />
                        <ThemeSwitcher collapsed={collapsed} />
                        <div className="h-px w-full bg-th-secondary-100" />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <Menu.Item
                        as="div"
                        disabled
                        className="group flex cursor-default items-center justify-between gap-2 px-4 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <div className="rounded-[23rem]">
                            <Localization
                              className={`h-5 w-5 ${activeIconClass} ${
                                collapsed && 'opacity-70'
                              } group-hover:opacity-70`}
                            />
                          </div>
                          <span
                            className={`${collapsedSideBar} ${activeTextClass} opacity-70 group-hover:opacity-70 lg:opacity-100`}
                          >
                            {t('Language')}
                          </span>
                        </div>
                        <SwitchLocalization collapsed={collapsed} />
                      </Menu.Item>

                      <Menu.Item
                        as="div"
                        disabled
                        className={`group flex cursor-default items-center justify-between gap-2 px-4 py-3 ${
                          modalsSidebarState.about ? 'bg-th-secondary-200' : 'opacity-70'
                        } hover:bg-th-secondary-200`}
                      >
                        <div
                          className="flex w-full cursor-pointer items-center gap-2"
                          onClick={() => {
                            openModal('about')
                          }}
                        >
                          <div className="rounded-[23rem]">
                            <About
                              className={`w-5 ${
                                modalsSidebarState.about
                                  ? 'stroke-th-text-primary'
                                  : activeIconClass
                              } ${collapsed ? 'opacity-70' : ''}`}
                            />
                          </div>
                          <ModalInSideBar
                            setIsOpen={(value) => {
                              setModalsSidebarState((prev) => ({
                                ...prev,
                                about: value,
                              }))
                              setCollapsed(!value)
                              setIsOpenSideBar(value)
                            }}
                            isOpen={modalsSidebarState.about}
                            buttonTitle={t('About')}
                            modalTitle={'LEVEL'}
                            collapsed={collapsed}
                          >
                            <AboutProject />
                          </ModalInSideBar>
                        </div>
                      </Menu.Item>
                      <Menu.Item
                        as="div"
                        disabled
                        className={`group flex cursor-default items-center justify-between gap-2 px-4 ${
                          modalsSidebarState.writeToUs
                            ? 'bg-th-secondary-200'
                            : 'opacity-70'
                        } hover:bg-th-secondary-200`}
                      >
                        <div
                          className="flex w-full cursor-pointer items-center gap-2 py-3"
                          onClick={() => {
                            openModal('writeToUs')
                          }}
                        >
                          <div className="rounded-[23rem]">
                            <WriteToUs
                              className={`h-5 w-5 ${
                                modalsSidebarState.writeToUs
                                  ? 'stroke-th-text-primary'
                                  : 'text-th-text-primary group-hover:text-th-text-primary lg:text-th-secondary-300'
                              }`}
                            />
                          </div>
                          <ModalInSideBar
                            isOpen={modalsSidebarState.writeToUs}
                            setIsOpen={(value) => {
                              setModalsSidebarState((prev) => ({
                                ...prev,
                                writeToUs: value,
                              }))
                              setCollapsed(!value)
                              setIsOpenSideBar(value)
                            }}
                            buttonTitle={t('start-page:WriteToUs')}
                            modalTitle={t('start-page:WriteToUs')}
                            collapsed={collapsed}
                          >
                            <Feedback />
                          </ModalInSideBar>
                        </div>
                      </Menu.Item>
                      <Menu.Item
                        as="div"
                        disabled
                        className={`group flex cursor-default items-center justify-between gap-2 px-4 py-3 ${
                          modalsSidebarState.aboutVersion
                            ? 'bg-th-secondary-200'
                            : 'opacity-70'
                        } hover:bg-th-secondary-200`}
                      >
                        <div
                          className="flex w-full cursor-pointer items-center gap-2"
                          onClick={() => {
                            openModal('aboutVersion')
                          }}
                        >
                          <div className="rounded-[23rem]">
                            <VersionLogo
                              className={`h-5 w-5 ${
                                modalsSidebarState.aboutVersion
                                  ? 'stroke-th-text-primary'
                                  : activeIconClass
                              } ${collapsed ? 'opacity-70' : ''}`}
                            />
                          </div>
                          <AboutVersion
                            onClose={(value) => {
                              setCollapsed(!value)
                              setIsOpenSideBar(value)
                            }}
                            collapsed={collapsed}
                          />
                        </div>
                      </Menu.Item>

                      <Menu.Item
                        as="div"
                        disabled
                        className="group flex cursor-default items-center justify-between gap-2 rounded-b-2xl hover:bg-th-secondary-200 lg:rounded-b-none"
                      >
                        <SignOut collapsed={collapsed} />
                      </Menu.Item>
                    </div>
                  </div>
                  <AvatarSelector id={user?.id} />
                </div>
              </div>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  )
}

export default SideBar
