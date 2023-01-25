import { useEffect, useState } from 'react'

import { useTranslation } from 'next-i18next'
import axios from 'axios'

import Modal from 'components/Modal'
import { useBrief } from 'utils/hooks'

function EditBrief({ user, projectId }) {
  const [showModalTranslationGoal, setShowModalTranslationGoal] = useState(false)
  const [briefDataCollection, setBriefDataCollection] = useState('')

  const { t } = useTranslation(['common', 'project-edit'])
  const [brief, { mutate }] = useBrief({
    token: user?.access_token,
    project_id: projectId,
  })

  useEffect(() => {
    setBriefDataCollection(brief?.data_collection)
  }, [brief])

  const saveToDatabase = () => {
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .put(`/api/briefs/${projectId}`, {
        data_collection: briefDataCollection,
      })
      .then(() => mutate())
      .catch((err) => console.log(err))
  }

  const closeModal = () => {
    setShowModalTranslationGoal(false)
  }
  // получить resume из массива
  // result = arr.map(obj => obj.resume).filter(item => item !== '')

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
        {briefDataCollection && (
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
                  <td className="border p-2 font-bold border-x-4">{`${briefDataCollection[0].id}. ${briefDataCollection[0].title}`}</td>
                  <td className="border p-2 font-bold border-x-4">{`${briefDataCollection[0].id}. ${briefDataCollection[0].title}`}</td>
                  <td rowSpan={6} className="p-2 border-b-4 border-x-4 text-center">
                    <textarea
                      defaultValue={briefDataCollection[0].resume}
                      onChange={(e) => {
                        setBriefDataCollection((prev) => {
                          const newArray = prev
                          newArray[0] = {
                            ...newArray[0],
                            resume: e.target.value,
                          }
                          return newArray
                        })
                      }}
                      className="p-2 outline-none w-full h-full"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border-x-4 p-2">
                    {briefDataCollection[0].block[0].question}
                  </td>
                  <td className="border border-x-4 p-2">
                    <textarea
                      defaultValue={briefDataCollection[0].block[0].answer}
                      onChange={(e) => {
                        setBriefDataCollection((prev) => {
                          const newArray = prev
                          newArray[0].block[0] = {
                            ...newArray[0].block[0],
                            answer: e.target.value,
                          }
                          return newArray
                        })
                      }}
                      className="outline-none w-full"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-x-4 p-2">
                    {briefDataCollection[0].block[1].question}
                  </td>
                  <td className="border border-x-4 p-2">
                    <textarea
                      defaultValue={briefDataCollection[0].block[1].answer}
                      onChange={(e) => {
                        setBriefDataCollection((prev) => {
                          const newArray = prev
                          newArray[0].block[1] = {
                            ...newArray[0].block[1],
                            answer: e.target.value,
                          }
                          return newArray
                        })
                      }}
                      className="outline-none w-full"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-x-4 p-2">
                    {briefDataCollection[0].block[2].question}
                  </td>
                  <td className="border border-x-4 p-2">
                    <textarea
                      defaultValue={briefDataCollection[0].block[2].answer}
                      onChange={(e) => {
                        setBriefDataCollection((prev) => {
                          const newArray = prev
                          newArray[0].block[2] = {
                            ...newArray[0].block[2],
                            answer: e.target.value,
                          }
                          return newArray
                        })
                      }}
                      className="outline-none w-full"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-x-4 p-2">
                    {briefDataCollection[0].block[3].question}
                  </td>
                  <td className="border border-x-4 p-2">
                    <textarea
                      defaultValue={briefDataCollection[0].block[3].answer}
                      onChange={(e) => {
                        setBriefDataCollection((prev) => {
                          const newArray = prev
                          newArray[0].block[3] = {
                            ...newArray[0].block[3],
                            answer: e.target.value,
                          }
                          return newArray
                        })
                      }}
                      className="outline-none w-full"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-x-4 border-b-2 p-2">
                    {briefDataCollection[0].block[4].question}
                  </td>
                  <td className="border border-x-4 border-b-2 p-2">
                    <textarea
                      defaultValue={briefDataCollection[0].block[4].answer}
                      onChange={(e) => {
                        setBriefDataCollection((prev) => {
                          const newArray = prev
                          newArray[0].block[4] = {
                            ...newArray[0].block[4],
                            answer: e.target.value,
                          }
                          return newArray
                        })
                      }}
                      className="outline-none w-full"
                    />
                  </td>
                </tr>

                <tr>
                  <td className="border p-2 font-bold border-t-4 border-x-4">{`${briefDataCollection[1].id}. ${briefDataCollection[1].title}`}</td>
                  <td className="border p-2 font-bold border-t-4 border-x-4">{`${briefDataCollection[1].id}. ${briefDataCollection[1].title}`}</td>
                  <td rowSpan={5} className="p-2 border-b-4 border-x-4 text-center">
                    <textarea
                      defaultValue={briefDataCollection[1].resume}
                      onChange={(e) => {
                        setBriefDataCollection((prev) => {
                          const newArray = prev
                          newArray[1] = {
                            ...newArray[1],
                            resume: e.target.value,
                          }
                          return newArray
                        })
                      }}
                      className="p-2 outline-none w-full h-full"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border-x-4 p-2">
                    {briefDataCollection[1].block[0].question}
                  </td>
                  <td className="border border-x-4 p-2">
                    <textarea
                      defaultValue={briefDataCollection[1].block[0].answer}
                      onChange={(e) => {
                        setBriefDataCollection((prev) => {
                          const newArray = prev
                          newArray[1].block[0] = {
                            ...newArray[1].block[0],
                            answer: e.target.value,
                          }
                          return newArray
                        })
                      }}
                      className="outline-none w-full"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-x-4 p-2">
                    {briefDataCollection[1].block[1].question}
                  </td>
                  <td className="border border-x-4 p-2">
                    <textarea
                      defaultValue={briefDataCollection[1].block[1].answer}
                      onChange={(e) => {
                        setBriefDataCollection((prev) => {
                          const newArray = prev
                          newArray[1].block[1] = {
                            ...newArray[1].block[1],
                            answer: e.target.value,
                          }
                          return newArray
                        })
                      }}
                      className="outline-none w-full"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-x-4 p-2">
                    {briefDataCollection[1].block[2].question}
                  </td>
                  <td className="border border-x-4 p-2">
                    <textarea
                      defaultValue={briefDataCollection[1].block[2].answer}
                      onChange={(e) => {
                        setBriefDataCollection((prev) => {
                          const newArray = prev
                          newArray[1].block[2] = {
                            ...newArray[1].block[2],
                            answer: e.target.value,
                          }
                          return newArray
                        })
                      }}
                      className="outline-none w-full"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-x-4 border-b-2 p-2">
                    {briefDataCollection[1].block[3].question}
                  </td>
                  <td className="border border-x-4 border-b-2 p-2">
                    <textarea
                      defaultValue={briefDataCollection[1].block[3].answer}
                      onChange={(e) => {
                        setBriefDataCollection((prev) => {
                          const newArray = prev
                          newArray[1].block[3] = {
                            ...newArray[1].block[3],
                            answer: e.target.value,
                          }
                          return newArray
                        })
                      }}
                      className="outline-none w-full"
                    />
                  </td>
                </tr>

                <tr>
                  <td className="border p-2 font-bold border-t-4 border-x-4">{`${briefDataCollection[2].id}. ${briefDataCollection[2].title}`}</td>
                  <td className="border p-2 font-bold border-t-4 border-x-4">{`${briefDataCollection[2].id}. ${briefDataCollection[2].title}`}</td>
                  <td rowSpan={6} className="p-2 border-x-4 text-center">
                    <textarea
                      defaultValue={briefDataCollection[2].resume}
                      onChange={(e) => {
                        setBriefDataCollection((prev) => {
                          const newArray = prev
                          newArray[2] = {
                            ...newArray[2],
                            resume: e.target.value,
                          }
                          return newArray
                        })
                      }}
                      className="p-2 outline-none w-full h-full"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border-x-4 p-2">
                    {briefDataCollection[2].block[0].question}
                  </td>
                  <td className="border border-x-4 p-2">
                    <textarea
                      defaultValue={briefDataCollection[2].block[0].answer}
                      onChange={(e) => {
                        setBriefDataCollection((prev) => {
                          const newArray = prev
                          newArray[2].block[0] = {
                            ...newArray[2].block[0],
                            answer: e.target.value,
                          }
                          return newArray
                        })
                      }}
                      className="outline-none w-full"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-x-4 p-2">
                    {briefDataCollection[2].block[1].question}
                  </td>
                  <td className="border border-x-4 p-2">
                    <textarea
                      defaultValue={briefDataCollection[2].block[1].answer}
                      onChange={(e) => {
                        setBriefDataCollection((prev) => {
                          const newArray = prev
                          newArray[2].block[1] = {
                            ...newArray[2].block[1],
                            answer: e.target.value,
                          }
                          return newArray
                        })
                      }}
                      className="outline-none w-full"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-x-4 p-2">
                    {briefDataCollection[2].block[2].question}
                  </td>
                  <td className="border border-x-4 p-2">
                    <textarea
                      defaultValue={briefDataCollection[2].block[2].answer}
                      onChange={(e) => {
                        setBriefDataCollection((prev) => {
                          const newArray = prev
                          newArray[2].block[2] = {
                            ...newArray[2].block[2],
                            answer: e.target.value,
                          }
                          return newArray
                        })
                      }}
                      className="outline-none w-full"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-x-4 p-2">
                    {briefDataCollection[2].block[3].question}
                  </td>
                  <td className="border border-x-4 p-2">
                    <textarea
                      defaultValue={briefDataCollection[2].block[3].answer}
                      onChange={(e) => {
                        setBriefDataCollection((prev) => {
                          const newArray = prev
                          newArray[2].block[3] = {
                            ...newArray[2].block[3],
                            answer: e.target.value,
                          }
                          return newArray
                        })
                      }}
                      className="outline-none w-full"
                    />
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
