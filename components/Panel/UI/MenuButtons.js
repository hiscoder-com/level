import { useState } from 'react'
import DropdownMenu from './DropdownMenu'
import Plus from 'public/plus.svg'

function MenuButtons({ classNames, menuItems }) {
  const [isOpenDotsMenu, setIsOpenDotsMenu] = useState(false)
  const [isOpenPlusMenu, setIsOpenPlusMenu] = useState(false)

  const buttons = [
    {
      id: 'plus',
      icon: <Plus className="w-6 h-6 stroke-th-text-secondary stroke-2" />,
      menu: menuItems,
      action: setIsOpenPlusMenu,
      isOpen: isOpenPlusMenu,
    },
    {
      id: 'dots',
      icon: (
        <div className="flex items-center justify-center w-6 h-6 gap-1">
          {[...Array(3).keys()].map((key) => (
            <div key={key} className="h-1 w-1 bg-th-secondary-10 rounded-full" />
          ))}
        </div>
      ),
      menu: menuItems,
      action: setIsOpenDotsMenu,
      isOpen: isOpenDotsMenu,
    },
  ].filter((item) => Object.keys(menuItems).includes(item.id))
  return (
    <div className="flex gap-2 relative ltr:flex-row rtl:flex-row-reverse">
      {buttons.map((button) => (
        <div key={button.id} className="relative">
          <button
            className="btn-tertiary p-3"
            onClick={() => button.action((prev) => !prev)}
          >
            {button.icon}
          </button>
          <DropdownMenu
            menuItems={menuItems[button.id]}
            classNames={classNames}
            isOpenMenu={button.isOpen}
            setIsOpenMenu={button.action}
          />
        </div>
      ))}
    </div>
  )
}

export default MenuButtons
