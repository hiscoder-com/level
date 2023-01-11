import { Fragment } from 'react'

import { Transition, Dialog } from '@headlessui/react'

function Modal({ title, children, isOpen, closeHandle, addClassName }) {
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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex items-center justify-center p-4 min-h-full">
            <Transition.Child
              as={Fragment}
              leaveFrom="opacity-100 scale-100"
              enterTo="opacity-100 scale-100"
              enterFrom="opacity-0 scale-95"
              enter="ease-out duration-300"
              leaveTo="opacity-0 scale-95"
              leave="ease-in duration-200"
            >
              <Dialog.Panel
                className={`transform overflow-hidden p-6 align-middle bg-white rounded-2xl shadow-xl transition-all ${
                  addClassName ? addClassName : 'w-full max-w-md'
                }`}
              >
                <Dialog.Title as="h3" className="h3 font-medium leading-6 text-center">
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
