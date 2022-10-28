import Link from 'next/link'

import { useTranslation } from 'next-i18next'

import SideBarLink from 'components/SideBarLink'

import Close from 'public/close.svg'

function SideBar({ isOpen, setIsOpen }) {
  const { t } = useTranslation('common')
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
              className="h-6 cursor-pointer stroke-1"
            />
          </div>
        </div>
        <div className="flex items-center h3 py-4 sidebar-hr">
          <Link href="/account">
            <a onClick={() => setIsOpen(false)} className="sidebar-link-a">
              <span className="tracking-wide truncate">{t('Account')}</span>
            </a>
          </Link>
        </div>

        <div>
          <ul className="flex flex-col py-4">
            <div className="text-xs font-light px-4 text-[#3C3C41]">{t('Project')}:</div>
            <div className="sidebar-hr">
              <SideBarLink href={'#'} text={t('OBS')} />
              <SideBarLink href={'#'} text={t('Bible')} />
              <SideBarLink href={'#'} text={t('NewProject')} />
            </div>
            <div className="sidebar-hr">
              <SideBarLink href={'#'} text={t('Management')} />
              <SideBarLink href={'#'} text={t('Dictionary')} />
              <SideBarLink href={'#'} text={t('Progress')} />
              <SideBarLink href={'#'} text={t('PurposeTranslation')} />
            </div>
            <SideBarLink href={'#'} text={t('Training')} />
            <SideBarLink href={'#'} text={t('Settings')} />
          </ul>
        </div>
      </div>
    </div>
  )
}

export default SideBar
