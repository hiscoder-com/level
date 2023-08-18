import { useTranslation } from 'react-i18next'
import { Menu } from '@headlessui/react'

import { useSetRecoilState } from 'recoil'

import AboutVersion from 'components/AboutVersion'
import SwitchLocalization from './SwitchLocalization'
import TranslatorImage from './TranslatorImage'
import SignOut from './SignOut'
import { aboutVersionModalIsOpen } from './Panel/state/atoms'
import { useCurrentUser } from 'lib/UserContext'

import Localization from 'public/localization.svg'
import VersionLogo from 'public/version.svg'
import Burger from 'public/burger.svg'
import Close from 'public/close.svg'

function SideBar({ setIsOpenSideBar, access }) {
  const { user } = useCurrentUser()
  const { t } = useTranslation('projects')
  const setVersionModalIsOpen = useSetRecoilState(aboutVersionModalIsOpen)

  return (
    <div className="flex items-center z-10">
      <Menu>
        {({ open }) => (
          <>
            <Menu.Button
              onClick={() => {
                setVersionModalIsOpen(false)
                setIsOpenSideBar((prev) => !prev)
              }}
            >
              {access &&
                (!open ? (
                  <Burger className="h-10 stroke-slate-600" />
                ) : (
                  <Close className="h-10 stroke-slate-600" />
                ))}
            </Menu.Button>

            <Menu.Items
              className="fixed flex flex-col w-full md:w-1/2 lg:w-[48%] xl:w-[27rem] gap-7 top-14 sm:top-20 -mx-5 z-20 cursor-default sm:px-5 md:pr-3 lg:pr-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative flex flex-col gap-7 p-3 sm:p-7 cursor-default border shadow-md border-gray-350 bg-white sm:rounded-2xl">
                <div>
                  <div className="flex items-center gap-2 pb-5 border-b cursor-default border-gray-300">
                    <div className="w-12 h-12 min-w-[3rem]">
                      <TranslatorImage item={{ users: user }} />
                    </div>

                    <div>
                      <div className="text-2xl font-bold">{user?.login}</div>
                      <div>{user?.email}</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between f-screen-appbar sm:min-h-[60vh]">
                  <div className="flex flex-col gap-7">
                    <Menu.Item
                      as="div"
                      disabled
                      className="flex items-center justify-between gap-2 cursor-default"
                    >
                      <div className="flex items-center gap-4">
                        <div className="px-4 py-2 rounded-[23rem] bg-gray-200">
                          <Localization className="w-5 h-5 min-w-[1.5rem] stroke-slate-600" />
                        </div>
                        <span>{t('Language')} </span>
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
                        onClick={() => setVersionModalIsOpen((prev) => !prev)}
                      >
                        <div className="px-4 py-2 rounded-[23rem] bg-gray-200">
                          <VersionLogo className="w-5 h-5 min-w-[1.5rem]" />
                        </div>
                        <AboutVersion isSidebar={true} />
                      </div>
                    </Menu.Item>
                  </div>

                  <div className="flex justify-center cursor-pointer">
                    <SignOut />
                  </div>
                </div>
              </div>
            </Menu.Items>
          </>
        )}
      </Menu>
    </div>
  )
}

export default SideBar
