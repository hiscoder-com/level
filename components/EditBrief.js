import { useEffect, useState } from 'react'

import { useTranslation } from 'next-i18next'
import axios from 'axios'

import Modal from 'components/Modal'
import { useBrief } from 'utils/hooks'

function EditBrief({ user, projectId }) {
  const [showModalTranslationGoal, setShowModalTranslationGoal] = useState(false)
  const [questionsArray, setQuestionsArray] = useState('')
  const [summaryText, setSummaryText] = useState('')

  const { t } = useTranslation(['common', 'project-edit'])
  const [brief, { mutate }] = useBrief({
    token: user?.access_token,
    project_id: projectId,
  })

  useEffect(() => {
    setQuestionsArray(brief?.questions)
    setSummaryText(brief?.summary)
  }, [brief])

  const saveToDatabase = () => {
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .put(`/api/briefs/${projectId}`, {
        questions: questionsArray,
        summary: summaryText,
      })
      .then(() => mutate())
      .catch((err) => console.log(err))
  }

  const closeModal = () => {
    setShowModalTranslationGoal(false)
  }

  // console.log(questionsArray[0].title)

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
        {questionsArray && (
          // <div className="text-center flex flex-row gap-4 my-6">
          //   <div className="w-1/3">
          //     <p className="mb-2 font-bold text-lg text-gray-500">{t('Questions')}</p>
          //     <div className="border-2 overflow-auto divide-y rounded-md p-2 text-gray-500 w-full h-[69vh]">
          //       <div className="text-left pb-3">
          //         <p className="font-bold mb-3">{`${questionsArray[0].id}. ${questionsArray[0].title}`}</p>
          //         <div className="h-20">{questionsArray[0].block[2].question}</div>
          //         <div className="mt-2 h-20">{questionsArray[0].block[1].question}</div>
          //       </div>
          //
          //   <div className="w-1/3">
          //     <p className="mb-2 font-bold text-lg text-gray-500">
          //       {t('project-edit:Answers')}
          //     </p>

          //     <div className="border-2 overflow-auto divide-y rounded-md p-2 text-gray-500 w-full h-[69vh]">
          //       <div className="text-left pb-3">
          //         <p className="font-bold mb-1">{`${questionsArray[0].id}. ${questionsArray[0].title}`}</p>
          //         <textarea
          //           className="p-2 outline-none w-full h-20"
          //           value={questionsArray[0].block[2].answer}
          //           // onChange={(e) => {
          //           //   setQuestionsArray((prev) => ({
          //           //     ...prev,
          //           //     question1: {
          //           //       ...prev[0],
          //           //       answers: e.target.value.split('\n'),
          //           //     },

          //           //     question1: {
          //           //       ...prev.question1,
          //           //       answers: e.target.value.split('\n'),
          //           //     },
          //           //   }))
          //           // }}
          //         />
          //         <textarea
          //           className="p-2 outline-none w-full h-28"
          //           value={questionsArray[0].block[1].answer}
          //         />
          //       </div>
          //       {/* <div className="text-left py-3">
          //         <p className="font-bold mb-1">
          //           {`${questionsArray[0].id}. ${questionsArray[1].title}`}
          //         </p>
          //         <textarea
          //           className="p-2 outline-none w-full h-40"
          //           // value={questionsArray?.question2?.answers.join('\n')}
          //           // onChange={(e) => {
          //           //   setQuestionsArray((prev) => ({
          //           //     ...prev,
          //           //     question2: {
          //           //       ...prev.question2,
          //           //       answers: e.target.value.split('\n'),
          //           //     },
          //           //   }))
          //           // }}
          //         />
          //   <div className="w-1/3">
          //     <p className="mb-2 font-bold text-lg text-gray-500">
          //       {t('PurposeTranslation')}
          //     </p>
          //     <textarea
          //       className="border-2 rounded-md p-2 text-gray-500 outline-none w-full h-[69vh]"
          //       placeholder={t('project-edit:SummaryPlaceholder')}
          //       onChange={(e) => setSummaryText(e.target.value)}
          //       value={summaryText}
          //     />
          //   </div>
          // </div>
          <div className="w-full h-[69vh]">
            <table className="table-fixed border-spacing-x-4 w-full border-separate border-spacing-y-0 my-6 text-gray-500">
              <thead className="font-bold text-lg">
                <tr>
                  <th className="pb-2 w-1\3">{t('Questions')}</th>
                  <th className="pb-2 w-1\3">{t('project-edit:Answers')}</th>
                  <th className="pb-2 w-1\3">{t('PurposeTranslation')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2 font-bold">{`${questionsArray[0].id}. ${questionsArray[0].title}`}</td>
                  <td className="border p-2 font-bold">{`${questionsArray[0].id}. ${questionsArray[0].title}`}</td>
                  <td rowSpan={6} className="border p-2">
                    Перевод будет сделан на азербайджанский язык, на латинице
                  </td>
                </tr>
                <tr>
                  <td className="border p-2">{questionsArray[0].block[0].question}</td>
                  <td className="border p-2">{questionsArray[0].block[0].answer}</td>
                </tr>
                <tr>
                  <td className="border p-2">{questionsArray[0].block[1].question}</td>
                  <td className="border p-2">{questionsArray[0].block[1].answer}</td>
                </tr>
                <tr>
                  <td className="border p-2">{questionsArray[0].block[2].question}</td>
                  <td className="border p-2">{questionsArray[0].block[2].answer}</td>
                </tr>
                <tr>
                  <td className="border p-2">{questionsArray[0].block[3].question}</td>
                  <td className="border p-2">{questionsArray[0].block[3].answer}</td>
                </tr>
                <tr>
                  <td className="border p-2">{questionsArray[0].block[4].question}</td>
                  <td className="border p-2">{questionsArray[0].block[4].answer}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
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
