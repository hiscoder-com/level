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
            {/* <textarea
              className="border-2 rounded-md p-2 text-gray-500 outline-none w-full h-[69vh]"
              placeholder={t('project-edit:QuestionsPlaceholder')}
              onChange={(e) => setQuestionsText(e.target.value)}
              value={questionsText}
              readOnly
            /> */}
            <div className="border-2 overflow-auto divide-y rounded-md p-2 text-gray-500 w-full h-[69vh]">
              <div className="text-left pb-3">
                <p className="font-bold mb-1">1. О языке</p>
                <p>- как называется язык?</p>
                <p>- какое межд.сокращение для языка?</p>
                <p>- где распространён?</p>
                <p>- почему выбран именно этот язык или диалект?</p>
                <p>- какой алфавит используется в данном языке?</p>
              </div>
              <div className="text-left py-3">
                <p className="font-bold mb-1">2. О необходимости перевода</p>
                <p>- почему нужен этот перевод?</p>
                <p>- какие переводы уже есть на этом языке?</p>
                <p>
                  - какие диалекты или другие языки могли бы пользоваться этим переводом?
                </p>
                <p>
                  - как вы думаете могут ли возникнуть трудности с другими командами, уже
                  работающими над переводом библейского контента на этот язык?
                </p>
              </div>
              <div className="text-left py-3">
                <p className="font-bold mb-1">3. О целевой аудитории перевода</p>
                <p>- кто будет пользоваться переводом?</p>
                <p>- на сколько человек в данной народности рассчитан этот перевод?</p>
                <p>
                  - какие языки используют постоянно эти люди, кроме своего родного языка?
                </p>
                <p>
                  - в этой народности больше мужчин/женщин, пожилых/молодых,
                  грамотных/неграмотных?
                </p>
              </div>
              <div className="text-left py-3">
                <p className="font-bold mb-1">4. О стиле перевода</p>
                <p>
                  - какой будет тип перевода, смысловой или подстрочный (дословный,
                  буквальный)?
                </p>
                <p>- какой будет стиль языка у перевода?</p>
                <p>- как будет распространяться перевод?</p>
              </div>
              <div className="text-left py-3">
                <p className="font-bold mb-1">5. О команде</p>
                <p>
                  - кто инициаторы перевода (кто проявил интерес к тому, чтобы начать
                  работу над переводом)?
                </p>
                <p>- кто будет работать над переводом?</p>
              </div>
              <div className="text-left pt-3">
                <p className="font-bold mb-1">6. О качестве перевода</p>
                <p>- кто будет оценивать перевод?</p>
                <p>- как будет поддерживаться качество перевода?</p>
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
