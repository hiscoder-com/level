import { Fragment } from 'react'

import Link from 'next/link'

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

import { modalsSidebar } from './state/atoms'

import { useCurrentUser } from 'lib/UserContext'

import Localization from 'public/localization.svg'
import VersionLogo from 'public/version.svg'
import Notepad from 'public/notepad.svg'
import Burger from 'public/burger.svg'
import Close from 'public/close.svg'
import Camera from 'public/camera.svg'
import User from 'public/user.svg'

function SideBar({ setIsOpenSideBar, access }) {
  const { user } = useCurrentUser()
  const { t } = useTranslation(['projects', 'users'])
  const [modalsSidebarState, setModalsSidebarState] = useRecoilState(modalsSidebar)

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

  return (
    <Menu>
      {({ open, close }) => (
        <>
          <Menu.Button
            onClick={() => {
              closeModal()
              setIsOpenSideBar((prev) => !prev)
            }}
            className="z-30"
          >
            {access &&
              (!open ? (
                <Burger className="h-10 stroke-th-text-secondary-100" />
              ) : (
                <Close className="h-10 stroke-th-text-secondary-100" />
              ))}
          </Menu.Button>
          <Transition
            as={Fragment}
            appear={true}
            show={open}
            enter="transition-opacity duration-200"
            leave="transition-opacity duration-200"
          >
            <Menu.Items
              className="fixed flex flex-col w-full md:w-1/2 lg:w-[48%] xl:w-[27rem] gap-7 top-14 sm:top-20 -mx-5 z-20 cursor-default sm:px-5 md:pr-3 lg:pr-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative flex flex-col gap-7 p-3 sm:p-7 cursor-default border shadow-md border-th-secondary-300 bg-th-secondary-10 sm:rounded-2xl">
                <div className="flex items-center gap-2 pb-5 border-b cursor-default border-th-secondary-300">
                  <div
                    className="relative w-16 h-16 min-w-[3rem] rounded-full overflow-hidden shadow-lg group"
                    onClick={() => openModal('avatarSelector')}
                  >
                    <TranslatorImage item={{ users: user }} isPointerCursor="true" />
                    <div className="absolute bottom-0 left-0 w-full h-1/3 bg-black opacity-70 md:opacity-0 group-hover:opacity-70 transition-opacity duration-500 flex justify-center items-center cursor-pointer">
                      <Camera className="w-4 text-white" />
                    </div>
                  </div>

                  <div>
                    <div className="text-2xl font-bold">{user?.login}</div>
                    <div>{user?.email}</div>
                  </div>
                </div>

                <div className="f-screen-appbar flex flex-col justify-between sm:min-h-[60vh]">
                  <div className="flex flex-col gap-7">
                    <Menu.Item
                      as="div"
                      disabled
                      className="flex items-center justify-between gap-2 cursor-default"
                    >
                      <div className="flex items-center gap-4">
                        <div className="px-4 py-2 rounded-[23rem] bg-th-secondary-100">
                          <Localization className="w-5 h-5 min-w-[1.5rem] stroke-th-text-primary" />
                        </div>
                        <span>{t('Language')}</span>
                      </div>
                      <SwitchLocalization />
                    </Menu.Item>

                    <Menu.Item
                      as="div"
                      disabled
                      className="flex items-center justify-between gap-2 cursor-default"
                    >
                      <div
                        className="flex w-full items-center gap-4 cursor-pointer"
                        onClick={() => openModal('aboutVersion')}
                      >
                        <div className="px-4 py-2 rounded-[23rem] bg-th-secondary-100 hover:opacity-70">
                          <VersionLogo className="w-5 h-5 min-w-[1.5rem] stroke-th-text-primary" />
                        </div>
                        <AboutVersion />
                      </div>
                    </Menu.Item>
                    <Menu.Item
                      as="div"
                      disabled
                      className="flex items-center justify-between gap-2 cursor-default"
                    >
                      <div
                        className="flex w-full items-center gap-4 cursor-pointer"
                        onClick={() => openModal('notepad')}
                      >
                        <div className="px-4 py-2 rounded-[23rem] bg-th-secondary-100 hover:opacity-70">
                          <Notepad className="w-5 h-5 min-w-[1.5rem] stroke-th-text-primary" />
                        </div>
                        <ModalInSideBar
                          isOpen={modalsSidebarState.notepad}
                          setIsOpen={(value) =>
                            setModalsSidebarState((prev) => ({ ...prev, notepad: value }))
                          }
                        >
                          <PersonalNotes />
                        </ModalInSideBar>
                      </div>
                    </Menu.Item>
                    {user?.is_admin && (
                      <Menu.Item as="div" disabled>
                        <Link href="/users" legacyBehavior>
                          <a
                            className="flex items-center gap-4 cursor-pointer"
                            onClick={() => {
                              closeModal()
                              setIsOpenSideBar(false)
                              close()
                            }}
                          >
                            <div className="px-4 py-2 rounded-[23rem] bg-th-secondary-100 hover:opacity-70">
                              <User className="w-5 h-5 min-w-[1.5rem] stroke-th-text-primary" />
                            </div>
                            <span className="hover:opacity-70">
                              {t('users:UserManagement')}
                            </span>
                          </a>
                        </Link>
                      </Menu.Item>
                    )}
                  </div>
                  <AvatarSelector id={user?.id} />
                  <div className="space-y-5">
                    <ThemeSwitcher />
                    <div
                      className="flex justify-center cursor-pointer"
                      onClick={() => {
                        setModalsSidebarState((prev) => ({
                          ...prev,
                          aboutVersion: false,
                        }))
                        setIsOpenSideBar((prev) => !prev)
                        close()
                      }}
                    >
                      <SignOut />
                    </div>
                  </div>
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
