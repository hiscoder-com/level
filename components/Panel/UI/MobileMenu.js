import { Fragment } from 'react'

import { Menu, Transition } from '@headlessui/react'
import Plus from 'public/plus.svg'

const MobileMenu = ({
  children,
  hideCloseButton,
  btnPositionHeight = 'bottom-[80vh]',
  mainHeight = 'h-[80vh]',
  onClose = () => {},
}) => {
  return (
    <Menu>
      {({ open }) => (
        <>
          <div
            className={`bg-zink-500 inset-0 z-20 bg-opacity-10 backdrop-blur backdrop-filter ${
              open ? 'fixed' : 'hidden'
            }`}
          ></div>
          <Menu.Button
            className={`fixed right-5 sm:hidden ${
              open ? btnPositionHeight : 'bottom-24'
            } z-30 translate-y-1/2 rounded-full bg-th-primary-100 p-4 text-th-text-secondary-100 transition-all duration-700 ${
              hideCloseButton ? '!hidden' : ''
            }`}
            onClick={onClose}
          >
            <Plus
              className={`h-7 w-7 transition-all duration-700 ${
                open ? 'rotate-45' : 'rotate-0'
              }`}
            />
          </Menu.Button>
          <Transition
            as={Fragment}
            show={open}
            enter="transition-all duration-700 ease-in-out transform"
            enterFrom="translate-y-full"
            enterTo="translate-y-0"
            leave="transition-all duration-700 ease-in-out transform"
            leaveFrom="translate-y-0"
            leaveTo="translate-y-full"
          >
            <div
              className={`fixed bottom-0 left-0 w-full ${mainHeight} z-20 overflow-y-auto rounded-t-2xl bg-th-secondary-10`}
            >
              {open && children}
            </div>
          </Transition>
        </>
      )}
    </Menu>
  )
}

export default MobileMenu
