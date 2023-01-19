import { useEffect, useState } from 'react'

import { useTranslation } from 'next-i18next'
import axios from 'axios'

import Modal from 'components/Modal'
import { useBrief } from 'utils/hooks'

function EditBrief({ user, projectId }) {
  const [showModalTranslationGoal, setShowModalTranslationGoal] = useState(false)
  const [questionsArray, setQuestionsArray] = useState('')

  const { t } = useTranslation(['common', 'project-edit'])
  const [brief, { mutate }] = useBrief({
    token: user?.access_token,
    project_id: projectId,
  })

  useEffect(() => {
    setQuestionsArray(brief?.questions)
  }, [brief])

  const saveToDatabase = () => {
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .put(`/api/briefs/${projectId}`, {
        questions: questionsArray,
      })
      .then(() => mutate())
      .catch((err) => console.log(err))
  }

  const closeModal = () => {
    setShowModalTranslationGoal(false)
  }
  console.log(questionsArray)
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
          // <div className="w-full h-[69vh]">
          <div className="w-full">
            <table className="table-fixed border-b-4 w-full my-6 text-gray-500">
              <thead className="font-bold text-lg">
                <tr>
                  <th className="pb-2 w-1\3 border-b-4">{t('Questions')}</th>
                  <th className="pb-2 w-1\3 border-b-4">{t('project-edit:Answers')}</th>
                  <th className="pb-2 w-1\3 border-b-4">{t('PurposeTranslation')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2 font-bold border-x-4">{`${questionsArray[0].id}. ${questionsArray[0].title}`}</td>
                  <td className="border p-2 font-bold border-x-4">{`${questionsArray[0].id}. ${questionsArray[0].title}`}</td>
                  <td rowSpan={6} className="p-2 border-b-4 border-x-4 text-center">
                    <textarea
                      value={questionsArray[0].resume}
                      onChange={(e) => {
                        setQuestionsArray((prev) => ({
                          ...prev,
                          // здесь объект, а нужно попасть в массив
                          [0]: {
                            ...prev[0],
                            resume: e.target.value,
                          },
                        }))
                      }}
                      className="p-2 outline-none w-full h-full"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border-x-4 p-2">
                    {questionsArray[0].block[0].question}
                  </td>
                  <td className="border border-x-4 p-2">
                    {questionsArray[0].block[0].answer}
                  </td>
                </tr>
                <tr>
                  <td className="border border-x-4 p-2">
                    {questionsArray[0].block[1].question}
                  </td>
                  <td className="border border-x-4 p-2">
                    {questionsArray[0].block[1].answer}
                  </td>
                </tr>
                <tr>
                  <td className="border border-x-4 p-2">
                    {questionsArray[0].block[2].question}
                  </td>
                  <td className="border border-x-4 p-2">
                    {questionsArray[0].block[2].answer}
                  </td>
                </tr>
                <tr>
                  <td className="border border-x-4 p-2">
                    {questionsArray[0].block[3].question}
                  </td>
                  <td className="border border-x-4 p-2">
                    {questionsArray[0].block[3].answer}
                  </td>
                </tr>
                <tr>
                  <td className="border border-x-4 border-b-2 p-2">
                    {questionsArray[0].block[4].question}
                  </td>
                  <td className="border border-x-4 border-b-2 p-2">
                    {questionsArray[0].block[4].answer}
                  </td>
                </tr>

                <tr>
                  <td className="border p-2 font-bold border-t-4 border-x-4">{`${questionsArray[1].id}. ${questionsArray[1].title}`}</td>
                  <td className="border p-2 font-bold border-t-4 border-x-4">{`${questionsArray[1].id}. ${questionsArray[1].title}`}</td>
                  <td rowSpan={5} className="p-2 border-b-4 border-x-4 text-center">
                    {questionsArray[1].resume}
                  </td>
                </tr>
                <tr>
                  <td className="border-x-4 p-2">
                    {questionsArray[1].block[0].question}
                  </td>
                  <td className="border border-x-4 p-2">
                    {questionsArray[1].block[0].answer}
                  </td>
                </tr>
                <tr>
                  <td className="border border-x-4 p-2">
                    {questionsArray[1].block[1].question}
                  </td>
                  <td className="border border-x-4 p-2">
                    {questionsArray[1].block[1].answer}
                  </td>
                </tr>
                <tr>
                  <td className="border border-x-4 p-2">
                    {questionsArray[1].block[2].question}
                  </td>
                  <td className="border border-x-4 p-2">
                    {questionsArray[1].block[2].answer}
                  </td>
                </tr>
                <tr>
                  <td className="border border-x-4 border-b-2 p-2">
                    {questionsArray[1].block[3].question}
                  </td>
                  <td className="border border-x-4 border-b-2 p-2">
                    {questionsArray[1].block[3].answer}
                  </td>
                </tr>

                <tr>
                  <td className="border p-2 font-bold border-t-4 border-x-4">{`${questionsArray[2].id}. ${questionsArray[2].title}`}</td>
                  <td className="border p-2 font-bold border-t-4 border-x-4">{`${questionsArray[2].id}. ${questionsArray[2].title}`}</td>
                  <td rowSpan={6} className="p-2 border-x-4 text-center">
                    {questionsArray[2].resume}
                  </td>
                </tr>
                <tr>
                  <td className="border-x-4 p-2">
                    {questionsArray[2].block[0].question}
                  </td>
                  <td className="border border-x-4 p-2">
                    {questionsArray[2].block[0].answer}
                  </td>
                </tr>
                <tr>
                  <td className="border border-x-4 p-2">
                    {questionsArray[2].block[1].question}
                  </td>
                  <td className="border border-x-4 p-2">
                    {questionsArray[2].block[1].answer}
                  </td>
                </tr>
                <tr>
                  <td className="border border-x-4 p-2">
                    {questionsArray[2].block[2].question}
                  </td>
                  <td className="border border-x-4 p-2">
                    {questionsArray[2].block[2].answer}
                  </td>
                </tr>
                <tr>
                  <td className="border border-x-4 p-2">
                    {questionsArray[2].block[3].question}
                  </td>
                  <td className="border border-x-4 p-2">
                    {questionsArray[2].block[3].answer}
                  </td>
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
