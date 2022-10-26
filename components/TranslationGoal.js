import { useState } from 'react'

import { useTranslation } from 'next-i18next'

import Modal from 'components/Modal'

function TGoal({ description }) {
  const [showModalTGoal, setShowModalTGoal] = useState(false)
  const { t } = useTranslation(['common'])

  const closeModal = () => {
    setShowModalTGoal(false)
  }

  return (
    <>
      <button
        className="btn-cyan w-36"
        onClick={(e) => (setShowModalTGoal(!showModalTGoal), e.stopPropagation())}
      >
        {t('AboutTranslation')}
      </button>
      <Modal
        isOpen={showModalTGoal}
        closeHandle={closeModal}
        title={t('TranslationGoal') + ':'}
      >
        <div className="mt-2">
          <p className="text-sm text-gray-500 whitespace-pre-line">{description}</p>
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

export default TGoal
