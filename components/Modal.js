import { Fragment } from 'react'

import { Transition, Dialog } from '@headlessui/react'

function Modal({
  title,
  isOpen,
  children,
  closeHandle,
  additionalClasses,
  className = 'primary',
  isMobileChangelog = false,
}) {
  const classes = {
    primary:
      'w-full align-middle bg-gradient-to-r from-slate-700 to-slate-600 text-blue-250',
    secondary: 'w-full align-middle bg-gray-400 text-white',
  }
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className={`z-50 ${isMobileChangelog ? 'fixed flex inset-0' : 'relative'}`}
        onClose={closeHandle}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className={`inset-0 bg-opacity-25 bg-gray-300 ${
              isMobileChangelog ? 'absolute' : 'fixed'
            }`}
          />
        </Transition.Child>
        <div
          className={`inset-0 ${
            isMobileChangelog ? 'relative' : 'fixed overflow-y-auto backdrop-blur'
          }`}
        >
          <div
            className={`${
              !isMobileChangelog && 'flex items-center justify-center p-4 min-h-full'
            }`}
          >
            <Transition.Child
              as={Fragment}
              leaveFrom="opacity-100 scale-100"
              enterFrom="opacity-100 scale-95"
              enterTo="opacity-100 scale-100"
              enter="ease-out duration-300"
              leaveTo="opacity-0 scale-95"
              leave="ease-in duration-200"
            >
              <Dialog.Panel
                className={`${
                  isMobileChangelog
                    ? 'px-6 pb-6 bg-white text-black'
                    : `${classes[className]} p-6 max-w-md rounded-3xl`
                } transform overflow-y-auto ${additionalClasses} shadow-xl transition-all`}
              >
                <Dialog.Title
                  as="h3"
                  className="text-center text-2xl font-medium leading-6"
                >
                  {title}
                </Dialog.Title>
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
export default Modal
