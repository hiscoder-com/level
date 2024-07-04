import { Fragment } from 'react'

import { Transition, Dialog } from '@headlessui/react'

function Modal({
  title,
  isOpen,
  children,
  closeHandle,
  className: propsClassNames = {},
  handleCloseDisabled = false,
}) {
  const classNames = {
    ...{
      main: 'z-50 relative',
      dialogTitle: 'text-center text-2xl font-medium leading-6',
      dialogPanel:
        'w-full max-w-md p-6 align-middle transform overflow-y-auto shadow-xl transition-all bg-th-primary-100 text-th-text-secondary-100 rounded-3xl',
      transitionChild: 'fixed inset-0 bg-opacity-25 backdrop-brightness-90',
      content:
        'inset-0 fixed flex items-center justify-center p-4 min-h-full overflow-y-auto',
    },
    ...propsClassNames,
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className={classNames.main}
        onClose={() => !handleCloseDisabled && closeHandle()}
      >
        <div className="inset-0 fixed backdrop-blur" />
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leaveTo="opacity-0"
        >
          <div className={classNames.transitionChild} />
        </Transition.Child>
        <div className={classNames.content}>
          <Transition.Child
            as={Fragment}
            leaveFrom="opacity-100 scale-100"
            enterFrom="opacity-100 scale-95"
            enterTo="opacity-100 scale-100"
            enter="ease-out duration-300"
            leaveTo="opacity-0 scale-95"
            leave="ease-in duration-200"
          >
            <Dialog.Panel className={classNames.dialogPanel}>
              <Dialog.Title as="h3" className={classNames.dialogTitle}>
                {title}
              </Dialog.Title>
              {children}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}
export default Modal
