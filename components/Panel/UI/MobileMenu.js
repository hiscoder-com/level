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
            className={`inset-0 bg-zink-500 bg-opacity-10 backdrop-blur z-20 backdrop-filter ${
              open ? 'fixed' : 'hidden'
            }`}
          ></div>
          <Menu.Button
            className={`fixed sm:hidden right-5 ${
              open ? btnPositionHeight : 'bottom-24'
            } p-4 translate-y-1/2 z-30 rounded-full transition-all duration-700 bg-th-primary-100 text-th-text-secondary-100 ${
              hideCloseButton ? '!hidden' : ''
            }`}
            onClick={onClose}
          >
            <Plus
              className={`w-7 h-7 transition-all duration-700 ${
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
              className={`fixed bottom-0 left-0 w-full ${mainHeight} overflow-y-auto rounded-t-2xl z-20 bg-th-secondary-10`}
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
