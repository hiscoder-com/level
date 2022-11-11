import { useState } from 'react'

import { useTranslation } from 'next-i18next'
import axios from 'axios'

import Modal from 'components/Modal'
import { useBriefs } from 'utils/hooks'

function EditBrief({ user, id }) {
  const [showModalTGoal, setShowModalTGoal] = useState(false)
  const [briefText, setBriefText] = useState('')

  const { t } = useTranslation(['common', 'project-edit'])
  const [briefs, { mutate }] = useBriefs({
    token: user?.access_token,
    project_id: id,
  })

  const saveToDatabase = () => {
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .put(`/api/briefs/${id}`, { text: briefText })
      .then(() => mutate())
      .catch((err) => console.log(err))
  }
  const closeModal = () => {
    setShowModalTGoal(false)
  }

  return (
    <>
      <button
        className="btn-cyan"
        onClick={(e) => (setShowModalTGoal((prev) => !prev), e.stopPropagation())}
      >
        {t('project-edit:EditBrief')}
      </button>

      <Modal
        isOpen={showModalTGoal}
        closeHandle={closeModal}
        title={t('TranslationGoal')}
      >
        <div className="text-center">
          <textarea
            placeholder={t('project-edit:BriefPlaceholder')}
            defaultValue={briefs?.text}
            onChange={(e) => setBriefText(e.target.value)}
            rows="15"
            cols="45"
            className="my-6 text-sm text-gray-500 outline-none whitespace-pre-line"
          ></textarea>
        </div>
        <div className="flex justify-center gap-4">
          <button className="btn-cyan w-28" onClick={saveToDatabase}>
            {t('Save')}
          </button>
          <button className="btn-cyan w-28" onClick={closeModal}>
            {t('Close')}
          </button>
        </div>
      </Modal>
    </>
  )
}

export default EditBrief
