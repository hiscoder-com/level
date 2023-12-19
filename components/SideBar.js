import { Fragment } from 'react'

import { useTranslation } from 'next-i18next'

import { Menu, Transition } from '@headlessui/react'

import { useSetRecoilState } from 'recoil'

import AboutVersion from 'components/AboutVersion'
import AvatarSelector from './AvatarSelector'
import SwitchLocalization from './SwitchLocalization'
import TranslatorImage from './TranslatorImage'
import SignOut from './SignOut'
import { aboutVersionModalIsOpen, avatarSelectorModalIsOpen } from './state/atoms'

import { useCurrentUser } from 'lib/UserContext'

import Localization from 'public/localization.svg'
import VersionLogo from 'public/version.svg'
import Burger from 'public/burger.svg'
import Close from 'public/close.svg'

function SideBar({ setIsOpenSideBar, access }) {
  const { user } = useCurrentUser()
  const { t } = useTranslation('projects')

  const setVersionModalIsOpen = useSetRecoilState(aboutVersionModalIsOpen)
  const setSelectorModalIsOpen = useSetRecoilState(avatarSelectorModalIsOpen)

  const openModal = (modalType) => {
    if (modalType === 'aboutVersion') {
      setSelectorModalIsOpen(false)
      setVersionModalIsOpen((prev) => !prev)
    } else if (modalType === 'avatarSelector') {
      setVersionModalIsOpen(false)
      setSelectorModalIsOpen((prev) => !prev)
    }
  }

  const closeModal = () => {
    setVersionModalIsOpen(false)
    setSelectorModalIsOpen(false)
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
                <Burger className="h-10 stroke-th-text-secondary" />
              ) : (
                <Close className="h-10 stroke-th-text-secondary" />
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
                    className="w-12 h-12 min-w-[3rem]"
                    onClick={() => openModal('avatarSelector')}
                  >
                    <TranslatorImage item={{ users: user }} />
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
                        <AboutVersion isSidebar={true} />
                      </div>
                    </Menu.Item>
                  </div>

                  <AvatarSelector />

                  <div
                    className="flex justify-center cursor-pointer"
                    onClick={() => {
                      closeModal()
                      setIsOpenSideBar((prev) => !prev)
                      close()
                    }}
                  >
                    <SignOut />
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
