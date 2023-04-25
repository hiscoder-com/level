import Link from 'next/link'

import { useTranslation } from 'next-i18next'

import SwitchLocalization from './SwitchLocalization'
import SignOut from './SignOut'

import Close from 'public/close.svg'

function SideBar({ isOpen, setIsOpen }) {
  const { t } = useTranslation('users')
  const condition = `absolute font-medium bg-black/70 left-0 top-0 right-0 bottom-0 z-10 ${
    isOpen ? '' : 'hidden'
  }`

  return (
    <div className={condition} onClick={() => setIsOpen(false)}>
      <div
        className="fixed top-0 left-0 w-full h-full text-lg bg-blue-150 sm:w-64"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        <div className="sidebar-hr">
          <div className="flex items-center justify-between px-4 py-3 text-[#3C3C41]">
            <Close
              onClick={() => setIsOpen(false)}
              className="h-8 cursor-pointer stroke-2"
            />
          </div>
        </div>
        <div className="flex items-center text-2xl py-4 sidebar-hr">
          <Link href="/account">
            <a onClick={() => setIsOpen(false)} className="sidebar-link-a">
              <span className="tracking-wide truncate">{t('Account')}</span>
            </a>
          </Link>
        </div>

        <div className="ml-4 mt-4">
          <SignOut />
        </div>
        <div className="ml-4 mt-4">
          <SwitchLocalization />
        </div>
      </div>
    </div>
  )
}

export default SideBar
