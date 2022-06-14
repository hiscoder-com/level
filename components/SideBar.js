import SideBarLink from './SideBarLink'
import { Burger } from '../public'

function SideBar({ isOpen, setIsOpen }) {
  const condition = `sidebar-absolute ${isOpen ? '' : 'hidden'}`
  return (
    <div className={condition}>
      <div className="fixed top-0 left-0 w-full h-full text-lg bg-[#c1c1c1] sm:w-64 sm:bg-[#c1c1c1]/50">
        <div className="sidebar-hr">
          <div className="flex items-center justify-between px-4 py-3 text-[#3C3C41]">
            <Burger
              onClick={() => setIsOpen((prev) => !prev)}
              className="h-6 cursor-pointer stroke-1 hover:stroke-[#0E7490]"
            />
          </div>
        </div>
        <div className="flex items-center h2 py-4 sidebar-hr">
          <a href="#" className="sidebar-link-a">
            <span className="tracking-wide truncate">Личный Кабинет</span>
          </a>
        </div>

        <div>
          <ul className="flex flex-col py-4">
            <div className="text-xs font-light px-4 text-[#3C3C41]">ПРОЕКТ:</div>
            <div className="sidebar-hr">
              <SideBarLink href={{ path: '#' }} link={{ text: 'ОБИ' }} />
              <SideBarLink href={{ path: '#' }} link={{ text: 'Библия' }} />
              <SideBarLink href={{ path: '#' }} link={{ text: '+ Новый проект' }} />
            </div>
            <div className="sidebar-hr">
              <SideBarLink href={{ path: '#' }} link={{ text: 'Администрирование' }} />
              <SideBarLink href={{ path: '#' }} link={{ text: 'Словарь' }} />
              <SideBarLink href={{ path: '#' }} link={{ text: 'Прогресс' }} />
              <SideBarLink href={{ path: '#' }} link={{ text: 'Цель перевода' }} />
            </div>
            <SideBarLink href={{ path: '#' }} link={{ text: 'Обучение' }} />
            <SideBarLink href={{ path: '#' }} link={{ text: 'Настройки' }} />
          </ul>
        </div>
      </div>
    </div>
  )
}

export default SideBar
