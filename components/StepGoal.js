import { useState } from 'react'

import { useTranslation } from 'next-i18next'

import Modal from 'components/Modal'

function StepGoal({ description, setOpen }) {
  const [showModalStepGoal, setShowModalStepGoal] = useState(false)
  const { t } = useTranslation(['common'])

  const closeModal = () => {
    setShowModalStepGoal(false)
  }

  return (
    <>
      <button
        className="w-36 py-2 rounded-t-lg	hover:bg-cyan-50
        active:bg-cyan-200"
        onClick={(e) => (setShowModalStepGoal(!showModalStepGoal), e.stopPropagation())}
      >
        {t('AboutStep')}
      </button>

      <Modal isOpen={showModalStepGoal} closeHandle={closeModal} title={t('Goal')}>
        <div className="my-6 py-3 overflow-auto" style={{ maxHeight: '50vh' }}>
          <p className="text-sm text-gray-500 whitespace-pre-line">
            {description.replaceAll('\n\n', '\n')}
          </p>
        </div>
        <div className="text-center">
          <button className="btn-cyan w-24" onClick={closeModal}>
            {t('Close')}
          </button>
        </div>
      </Modal>
    </>
  )
}

export default StepGoal
