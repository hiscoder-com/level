import { useEffect, useState } from 'react'

import { useTranslation } from 'next-i18next'
import axios from 'axios'

import Modal from 'components/Modal'
import { useBrief } from 'utils/hooks'

function EditBrief({ user, projectId }) {
  const [showModalTranslationGoal, setShowModalTranslationGoal] = useState(false)
  const [questionsText, setQuestionsText] = useState('')
  const [answersText, setAnswersText] = useState('')
  const [summaryText, setSummaryText] = useState('')

  const { t } = useTranslation(['common', 'project-edit'])
  const [brief, { mutate }] = useBrief({
    token: user?.access_token,
    project_id: projectId,
  })

  useEffect(() => {
    setQuestionsText(brief?.questions)
    setAnswersText(brief?.answers)
    setSummaryText(brief?.summary)
  }, [brief])

  const saveToDatabase = () => {
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .put(`/api/briefs/${projectId}`, {
        questions: questionsText,
        answers: answersText,
        summary: summaryText,
      })
      .then(() => mutate())
      .catch((err) => console.log(err))
  }

  const closeModal = () => {
    setShowModalTranslationGoal(false)
  }

  return (
    <>
      <button
        className="btn-cyan"
        onClick={(e) => (setShowModalTranslationGoal(true), e.stopPropagation())}
      >
        {t('project-edit:EditBrief')}
      </button>

      <Modal
        title={t('project-edit:EditBriefTitle')}
        addClassName={'w-full max-w-full'}
        isOpen={showModalTranslationGoal}
        closeHandle={closeModal}
      >
        <div className="text-center flex flex-row gap-4 my-6">
          <div className="w-1/3">
            <p className="mb-2">{t('Questions')}</p>
            <textarea
              className="border-2 rounded-md p-2 text-gray-500 outline-none w-full h-[69vh]"
              placeholder={t('project-edit:QuestionsPlaceholder')}
              onChange={(e) => setQuestionsText(e.target.value)}
              value={questionsText}
              readOnly
            />
          </div>
          <div className="w-1/3">
            <p className="mb-2">{t('project-edit:Answers')}</p>
            <textarea
              className="border-2 rounded-md p-2 text-gray-500 outline-none w-full h-[69vh]"
              placeholder={t('project-edit:AnswersPlaceholder')}
              onChange={(e) => setAnswersText(e.target.value)}
              value={answersText}
            />
          </div>
          <div className="w-1/3">
            <p className="mb-2">{t('project-edit:Summary')}</p>
            <textarea
              className="border-2 rounded-md p-2 text-gray-500 outline-none w-full h-[69vh]"
              placeholder={t('project-edit:SummaryPlaceholder')}
              onChange={(e) => setSummaryText(e.target.value)}
              value={summaryText}
            />
          </div>
        </div>
        <div className="flex justify-center gap-4">
          <button className="btn-cyan" onClick={saveToDatabase}>
            {t('Save')}
          </button>
          <button className="btn-cyan" onClick={closeModal}>
            {t('Close')}
          </button>
        </div>
      </Modal>
    </>
  )
}

export default EditBrief
