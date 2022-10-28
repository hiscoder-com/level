import { useState } from 'react'

import { useTranslation } from 'next-i18next'

import Modal from 'components/Modal'

function StepGoal({ description }) {
  const [showModalStepGoal, setShowModalStepGoal] = useState(false)
  const { t } = useTranslation(['common'])

  const closeModal = () => {
    setShowModalStepGoal(false)
  }

  return (
    <>
      <button
        className="btn-cyan w-36"
        onClick={(e) => (setShowModalStepGoal(!showModalStepGoal), e.stopPropagation())}
      >
        {t('AboutStep')}
      </button>

      <Modal isOpen={showModalStepGoal} closeHandle={closeModal} title={t('Goal')}>
        <div className="mt-2 py-3 overflow-auto" style={{ maxHeight: '50vh' }}>
          <p className="text-sm text-gray-500 whitespace-pre-line">
            {description.replaceAll('\n\n', '\n')}
          </p>
        </div>
        <div className="mt-4">
          <button className="btn-cyan w-24" onClick={closeModal}>
            {t('Close')}
          </button>
        </div>
      </Modal>
    </>
  )
}

export default StepGoal
