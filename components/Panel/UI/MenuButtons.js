import { useState } from 'react'

import DropdownMenu from './DropdownMenu'

import Plus from 'public/icons/plus.svg'

function MenuButtons({ classNames, menuItems, disabled = false }) {
  const [isOpenDotsMenu, setIsOpenDotsMenu] = useState(false)
  const [isOpenPlusMenu, setIsOpenPlusMenu] = useState(false)

  const buttons = [
    {
      id: 'plus',
      icon: <Plus className="stroke-th-text-secondary h-6 w-6 stroke-2" />,
      menu: menuItems,
      action: setIsOpenPlusMenu,
      isOpen: isOpenPlusMenu,
    },
    {
      id: 'dots',
      icon: (
        <div className="flex h-6 w-6 items-center justify-center gap-1">
          {[...Array(3).keys()].map((key) => (
            <div key={key} className="h-1 w-1 rounded-full bg-th-secondary-10" />
          ))}
        </div>
      ),
      menu: menuItems,
      action: setIsOpenDotsMenu,
      isOpen: isOpenDotsMenu,
    },
  ].filter((item) => Object.keys(menuItems).includes(item.id))
  return (
    <div className="relative flex gap-2 ltr:flex-row rtl:flex-row-reverse">
      {buttons.map((button) => (
        <div key={button.id} className="relative">
          <button
            disabled={disabled}
            className={`btn-tertiary mb-3 p-3 ${disabled ? 'opacity-70' : ''}`}
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
