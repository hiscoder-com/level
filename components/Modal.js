import { Fragment, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'
import { Dialog, Transition } from '@headlessui/react'

import { steps } from 'utils/steps'

function Modal() {
  const [showModalStepGoal, setShowModalStepGoal] = useState(false)
  const router = useRouter()
  const { step } = router.query
  const { t } = useTranslation(['steps', 'common'])

  const closeModal = () => {
    setShowModalStepGoal(false)
  }

  return (
    <>
      <button
        className="btn-cyan w-28"
        onClick={(e) => (setShowModalStepGoal(!showModalStepGoal), e.stopPropagation())}
      >
        {t('common:Goal')}
      </button>

      <Transition appear show={showModalStepGoal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex items-center justify-center p-4 min-h-full text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="modal-step-goal">
                  <Dialog.Title as="h3" className="h3 font-medium leading-6">
                    {t('common:Goal')}:
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">{t(steps[step].stepGoal)}</p>
                  </div>

                  <div className="mt-4">
                    <button className="btn-cyan w-24" onClick={closeModal}>
                      {t('common:Close')}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default Modal
