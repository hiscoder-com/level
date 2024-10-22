import { Fragment, useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import { Menu, Transition } from '@headlessui/react'

import { useRecoilState } from 'recoil'

import AboutVersion from 'components/AboutVersion'
import AvatarSelector from './AvatarSelector'
import SwitchLocalization from './SwitchLocalization'
import TranslatorImage from './TranslatorImage'
import ThemeSwitcher from './ThemeSwitcher'
import SignOut from './SignOut'
import ModalInSideBar from './ModalInSideBar'
import { PersonalNotes } from './Panel'
import ProjectCreate from './ProjectCreate'
import AboutProject from './AboutProject'

import { modalsSidebar } from './state/atoms'

import { useCurrentUser } from 'lib/UserContext'

import Localization from 'public/localization.svg'
import VersionLogo from 'public/version.svg'
import Burger from 'public/burger.svg'
import Close from 'public/close.svg'
import Camera from 'public/camera.svg'

import Account from 'public/account.svg'
import Projects from 'public/projects.svg'
import CreateProject from 'public/create-project.svg'
import Notes from 'public/notes.svg'
import Users from 'public/users.svg'
import About from 'public/about.svg'

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
  const [showAbout, setShowAbout] = useState(false)
  const [showCreate, setShowCreate] = useState(false)

  const collapsedSideBar = collapsed ? 'lg:hidden' : ''

  const router = useRouter()

  const openModal = (modalType) => {
    setModalsSidebarState((prevModals) => ({
      aboutVersion: modalType === 'aboutVersion' ? !prevModals.aboutVersion : false,
      avatarSelector: modalType === 'avatarSelector' ? !prevModals.avatarSelector : false,
      notepad: modalType === 'notepad' ? !prevModals.notepad : false,
    }))
  }

  const closeModal = () => {
    setModalsSidebarState({
      aboutVersion: false,
      avatarSelector: false,
      notepad: false,
    })
  }

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
      setShowAbout(false)
    }
  }, [isOpenSideBar])

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
              setShowAbout(false)

              setShowCreate(false)
            }}
            as={Fragment}
            appear={open}
            show={isLargeScreen || open}
            enter="transition-opacity duration-200"
            leave="transition-opacity duration-200"
          >
            <Menu.Items
              className={`fixed flex flex-col w-full h-[calc(100vh-52px)] md:w-1/2 transition-all duration-150 gap-7 top-14 sm:top-20 lg:top-16 lg:h-[calc(100vh-64px)] lg:left-0 -mx-5 z-20 cursor-default sm:px-5 md:pr-3 ${
                !collapsed ? 'lg:w-56' : 'lg:w-[3.25rem] lg:ml-0 lg:p-0 2xl:mx-0'
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
                  showAbout
                ) {
                  return
                }
                setCollapsed(true)
                closeModal()
                close()
                setIsOpenSideBar(false)
                setShowAbout(false)
              }}
            >
              <div className="relative h-full flex flex-col gap-2 cursor-default border shadow-md border-th-secondary-300 bg-th-secondary-10 sm:rounded-2xl lg:h-screen lg:rounded-none">
                <div
                  className={`flex items-center gap-2 border-b cursor-default border-th-secondary-300 lg:flex-col lg:items-start lg:border-b-0 overflow-hidden py-4 px-4 ${
                    collapsed ? 'lg:w-0 lg:px-0' : 'lg:w-full'
                  }`}
                >
                  <div
                    className="relative w-16 h-16 min-w-[3rem] rounded-full shadow-lg group"
                    onClick={() => openModal('avatarSelector')}
                  >
                    <TranslatorImage item={{ users: user }} isPointerCursor="true" />
                    <div className="absolute top-0 start-0 w-full h-full rounded-full overflow-hidden">
                      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-black opacity-70 md:opacity-0 group-hover:opacity-70 transition-opacity duration-500 flex justify-center items-center cursor-pointer">
                        <Camera className="w-4 text-white" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-2xl font-bold lg:font-medium lg:text-base">
                      {user?.login}
                    </div>
                    <div className="lg:text-xs">{user?.email}</div>
                  </div>
                </div>

                <div className="f-screen-appbar flex flex-col justify-between sm:min-h-[60vh] grow">
                  <div className="flex flex-col text-sm justify-between grow gap-8">
                    <div className="flex flex-col">
                      <Menu.Item
                        as="div"
                        disabled
                        className={`group py-3 px-4 ${
                          router.query?.tab !== '0' ? 'opacity-70' : 'bg-th-secondary-200'
                        } hover:bg-th-secondary-200`}
                      >
                        <Link href="/account?tab=0" legacyBehavior>
                          <a
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => {
                              closeModal()
                              setIsOpenSideBar(false)
                              close()
                              setShowAbout(false)
                            }}
                          >
                            <div className="rounded-[23rem]">
                              <Account
                                className={`w-4 ml-0.5 ${
                                  router.query?.tab === '0'
                                    ? 'stroke-th-text-primary'
                                    : activeIconClass
                                }`}
                              />
                            </div>
                            <span
                              className={`${collapsedSideBar} ${
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
                        className={`group py-3 px-4 ${
                          router.query?.tab !== '1' ? 'opacity-70' : 'bg-th-secondary-200'
                        } hover:bg-th-secondary-200`}
                      >
                        <Link href="/account?tab=1" legacyBehavior>
                          <a
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => {
                              closeModal()
                              setIsOpenSideBar(false)
                              close()
                              setShowAbout(false)
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
                          className={`group hidden md:block py-3 px-4 ${
                            router.query?.tab !== '2'
                              ? 'opacity-70'
                              : 'bg-th-secondary-200'
                          } hover:bg-th-secondary-200`}
                        >
                          <Link href="/account?tab=2" legacyBehavior>
                            <a
                              className="flex items-center gap-2 cursor-pointer"
                              onClick={() => {
                                closeModal()
                                setIsOpenSideBar(false)
                                close()
                                setShowAbout(false)
                              }}
                            >
                              <div className="rounded-[23rem]">
                                <CreateProject
                                  className={`w-5 h-5 ${
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
                                    : 'lg:w-auto transition-all duration-700 delay-700'
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
                          className={`flex px-4 py-3 items-center justify-between gap-2 cursor-default md:hidden ${
                            !showCreate ? 'opacity-70' : ''
                          }`}
                        >
                          <div
                            className="flex w-full items-center gap-2 cursor-pointer"
                            onClick={() => {
                              setShowCreate((prev) => !prev)
                              openModal()
                            }}
                          >
                            <div className="rounded-[23rem] hover:opacity-70">
                              <CreateProject
                                className={`w-5 h-5 ${
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
                        className={`group py-3 px-4 flex items-center justify-between gap-2 cursor-default ${
                          modalsSidebarState.notepad
                            ? 'bg-th-secondary-200'
                            : 'opacity-70'
                        } hover:bg-th-secondary-200`}
                      >
                        <div
                          className="flex w-full items-center gap-2 cursor-pointer"
                          onClick={() => {
                            openModal('notepad')
                            setShowAbout(false)
                          }}
                        >
                          <div className="rounded-[23rem]">
                            <Notes
                              className={`w-5 h-5 ${
                                modalsSidebarState.notepad
                                  ? 'stroke-th-text-primary'
                                  : 'text-th-text-primary lg:text-th-secondary-300 group-hover:text-th-text-primary'
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
                          className={`group py-3 px-4 ${
                            router.pathname === '/users'
                              ? 'bg-th-secondary-200'
                              : 'opacity-70'
                          } hover:bg-th-secondary-200`}
                        >
                          <Link href="/users" legacyBehavior>
                            <a
                              className="flex items-center gap-2 cursor-pointer"
                              onClick={() => {
                                closeModal()
                                setIsOpenSideBar(false)
                                close()
                                setShowAbout(false)
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
                      <div className="space-y-2 mt-2">
                        <div className="w-full h-px bg-th-secondary-100" />
                        <ThemeSwitcher collapsed={collapsed} />
                        <div className="w-full h-px bg-th-secondary-100" />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <Menu.Item
                        as="div"
                        disabled
                        className="group py-2 px-4 flex items-center justify-between gap-2 cursor-default "
                      >
                        <div className="flex items-center gap-2">
                          <div className="rounded-[23rem]">
                            <Localization
                              className={`w-5 h-5 ${activeIconClass} ${
                                collapsed && 'opacity-70'
                              } group-hover:opacity-70`}
                            />
                          </div>
                          <span
                            className={`${collapsedSideBar} ${activeTextClass} opacity-70 lg:opacity-100 group-hover:opacity-70`}
                          >
                            {t('Language')}
                          </span>
                        </div>
                        <SwitchLocalization collapsed={collapsed} />
                      </Menu.Item>

                      <Menu.Item
                        as="div"
                        disabled
                        className={`group py-3 px-4 flex items-center justify-between gap-2 cursor-default ${
                          showAbout ? 'bg-th-secondary-200' : 'opacity-70'
                        } hover:bg-th-secondary-200`}
                      >
                        <div
                          className="flex w-full items-center gap-2 cursor-pointer"
                          onClick={() => {
                            setShowAbout((prev) => !prev)
                            openModal()
                          }}
                        >
                          <div className="rounded-[23rem]">
                            <About
                              className={`w-5 ${
                                showAbout ? 'stroke-th-text-primary' : activeIconClass
                              } ${collapsed ? 'opacity-70' : ''}`}
                            />
                          </div>
                          <ModalInSideBar
                            setIsOpen={(value) => {
                              setShowAbout(value)
                              setCollapsed(!value)
                              setIsOpenSideBar(value)
                            }}
                            isOpen={showAbout}
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
                        className={`group py-3 px-4 flex items-center justify-between gap-2 cursor-default ${
                          modalsSidebarState.aboutVersion
                            ? 'bg-th-secondary-200'
                            : 'opacity-70'
                        } hover:bg-th-secondary-200`}
                      >
                        <div
                          className="flex w-full items-center gap-2 cursor-pointer"
                          onClick={() => {
                            openModal('aboutVersion')
                            setShowAbout(false)
                          }}
                        >
                          <div className="rounded-[23rem]">
                            <VersionLogo
                              className={`w-5 h-5 ${
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
                        className="group flex items-center justify-between gap-2 cursor-default hover:bg-th-secondary-200 rounded-b-2xl lg:rounded-b-none"
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
