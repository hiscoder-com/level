import { Fragment } from 'react'

import { Transition, Dialog } from '@headlessui/react'

function Modal({
  title,
  children,
  isOpen,
  closeHandle,
  additionalClasses,
  className = 'primary',
}) {
  const classes = {
    primary: 'bg-gradient-to-r from-slate-700 to-slate-600 text-blue-250',
    secondary: 'bg-gray-400 text-white',
  }
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeHandle}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-300 bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto backdrop-blur">
          <div className="flex items-center justify-center p-4 min-h-full">
            <Transition.Child
              as={Fragment}
              leaveFrom="opacity-100 scale-100"
              enterTo="opacity-100 scale-100"
              enterFrom="opacity-100 scale-95"
              enter="ease-out duration-300"
              leaveTo="opacity-0 scale-95"
              leave="ease-in duration-200"
            >
              <Dialog.Panel
                className={`${classes[className]} w-full max-w-md transform overflow-y-auto ${additionalClasses} p-6 align-middle rounded-3xl shadow-xl transition-all`}
              >
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-medium leading-6 text-center"
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
