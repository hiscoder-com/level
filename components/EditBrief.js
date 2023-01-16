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
            <p className="mb-2 font-bold text-lg text-gray-500">{t('Questions')}</p>
            <div className="border-2 overflow-auto divide-y rounded-md p-2 text-gray-500 w-full h-[69vh]">
              <div className="text-left pb-3">
                <p className="font-bold mb-1">
                  {questionsText?.question1?.question_title}
                </p>
                <div>
                  {questionsText?.question1?.questions?.map((question, index) => {
                    return <li key={index}>{question}</li>
                  })}
                </div>
              </div>
              <div className="text-left py-3">
                <p className="font-bold mb-1">
                  {questionsText?.question2?.question_title}
                </p>
                <div>
                  {questionsText?.question2?.questions?.map((question, index) => {
                    return <li key={index}>{question}</li>
                  })}
                </div>
              </div>
              <div className="text-left py-3">
                <p className="font-bold mb-1">
                  {questionsText?.question3?.question_title}
                </p>
                <div>
                  {questionsText?.question3?.questions?.map((question, index) => {
                    return <li key={index}>{question}</li>
                  })}
                </div>
              </div>
              <div className="text-left py-3">
                <p className="font-bold mb-1">
                  {questionsText?.question4?.question_title}
                </p>
                <div>
                  {questionsText?.question4?.questions?.map((question, index) => {
                    return <li key={index}>{question}</li>
                  })}
                </div>
              </div>
              <div className="text-left py-3">
                <p className="font-bold mb-1">
                  {questionsText?.question5?.question_title}
                </p>
                <div>
                  {questionsText?.question5?.questions?.map((question, index) => {
                    return <li key={index}>{question}</li>
                  })}
                </div>
              </div>
              <div className="text-left pt-3">
                <p className="font-bold mb-1">
                  {questionsText?.question6?.question_title}
                </p>
                <div>
                  {questionsText?.question6?.questions?.map((question, index) => {
                    return <li key={index}>{question}</li>
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="w-1/3">
            <p className="mb-2 font-bold text-lg text-gray-500">
              {t('project-edit:Answers')}
            </p>
            <textarea
              className="border-2 rounded-md p-2 text-gray-500 outline-none w-full h-[69vh]"
              placeholder={t('project-edit:AnswersPlaceholder')}
              onChange={(e) => setAnswersText(e.target.value)}
              value={answersText}
            />
          </div>
          <div className="w-1/3">
            <p className="mb-2 font-bold text-lg text-gray-500">
              {t('PurposeTranslation')}
            </p>
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
