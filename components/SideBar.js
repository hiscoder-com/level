import Link from 'next/link'

import { useTranslation } from 'next-i18next'

import SideBarLink from './SideBarLink'

import Close from '../public/close.svg'

function SideBar({ isOpen, setIsOpen }) {
  const { t } = useTranslation('common')
  const condition = `sidebar-absolute ${isOpen ? '' : 'hidden'}`
  return (
    <div className={condition}>
      <div className="fixed top-0 left-0 w-full h-full text-lg bg-[#c1c1c1] sm:w-64 sm:bg-[#c1c1c1]/80">
        <div className="sidebar-hr">
          <div className="flex items-center justify-between px-4 py-3 text-[#3C3C41]">
            <Close
              onClick={() => setIsOpen((prev) => !prev)}
              className="h-6 cursor-pointer stroke-1 hover:stroke-[#0E7490]"
            />
          </div>
        </div>
        <div className="flex items-center h2 py-4 sidebar-hr">
          <Link href="/account">
            <a className="sidebar-link-a">
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
