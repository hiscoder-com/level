import { useState } from 'react'

import { useTranslation } from 'next-i18next'

import Modal from 'components/Modal'

function EditBrief() {
  const [showModalTGoal, setShowModalTGoal] = useState(false)
  const { t } = useTranslation(['common', 'project-edit'])

	const closeModal = () => {
    setShowModalTGoal(false)
  }

  return (
    <>
      <button
        className="btn-cyan"
        onClick={(e) => (setShowModalTGoal(!showModalTGoal), e.stopPropagation())}
      >
              {t('project-edit:EditBrief')}
      </button>
      <Modal
        isOpen={showModalTGoal}
        closeHandle={closeModal}
        title={t('TranslationGoal') + ':'}
      >
        <div className="mt-2">
          {/* <p className="text-sm text-gray-500 whitespace-pre-line">Текстовое поле для редактирования брифа</p> */}
					<textarea rows="15" cols="45"></textarea>
        </div>
        <div className="mt-4">
          <button className="btn-cyan w-24" onClick={closeModal}> 
            {t('Save')}
          </button>

        </div>
      </Modal>
    </>
  )
}

export default EditBrief


{/* <button className="btn-cyan w-24" onClick={closeModal}> // вынести в отдельную функцию и добавить сохранение в базу */}
