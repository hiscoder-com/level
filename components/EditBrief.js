import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import axios from 'axios'

import { useBrief, useProject } from 'utils/hooks'
import { useCurrentUser } from 'lib/UserContext'

function EditBrief() {
  const [briefDataCollection, setBriefDataCollection] = useState('')
  const {
    query: { code },
  } = useRouter()
  const { user } = useCurrentUser()
  const [project] = useProject({ token: user?.access_token, code })

  const { t } = useTranslation(['common', 'project-edit'])
  const [brief, { mutate }] = useBrief({
    token: user?.access_token,
    project_id: project?.id,
  })

  useEffect(() => {
    setBriefDataCollection(brief?.data_collection)
  }, [brief])

  const saveToDatabase = () => {
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .put(`/api/briefs/${project?.id}`, {
        data_collection: briefDataCollection,
      })
      .then(() => mutate())
      .catch((err) => console.log(err))
  }

  // console.log(briefDataCollection)

  return (
    <div className="divide-y-2 divide-gray-400">
      <div className="pb-5">
        <div className="h3">
          <Link href={`/projects/${project?.code}/edit`}>
            <a className="underline text-blue-700">« {project?.title}</a>
          </Link>
        </div>

        <div className="mt-5">
          {briefDataCollection && (
            <div className="w-full">
              <table className="table-fixed border-b-4 w-full my-6 text-sm text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="py-3 px-6">{t('Questions')}</th>
                    <th className="py-3 px-6">{t('project-edit:Answers')}</th>
                    <th className="py-3 px-6">{t('PurposeTranslation')}</th>
                  </tr>
                </thead>
                <tbody>
                  {briefDataCollection.map((briefItem, index) => {
                    return (
                      <>
                        <tr key={index} className="bg-white border-b">
                          <td className="border p-2 font-bold border-x-2">{`${briefItem.id}. ${briefItem.title}`}</td>
                          <td className="border p-2 font-bold border-x-2">{`${briefItem.id}. ${briefItem.title}`}</td>
                          <td className="border p-2 border-b-4 border-x-2 text-center">
                            <textarea
                              defaultValue={briefItem.resume}
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
                        {briefItem.block?.map((questionAndAnswerPair, index) => {
                          return (
                            <tr key={index} className="bg-white border-b">
                              <td className="border-x-2 p-2">
                                {questionAndAnswerPair.question}
                              </td>
                              <td className="border border-x-2 p-2">
                                <textarea
                                  // defaultValue={briefDataCollection[0].block[0].answer}
                                  defaultValue={questionAndAnswerPair.answer}
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
                          )
                        })}
                      </>
                    )
                  })}
                </tbody>
                {/* <tbody>
                  <tr className="bg-white border-b">
                    <td className="border p-2 font-bold border-x-2">{`${briefDataCollection[0].id}. ${briefDataCollection[0].title}`}</td>
                    <td className="border p-2 font-bold border-x-2">{`${briefDataCollection[0].id}. ${briefDataCollection[0].title}`}</td>
                    <td
                      rowSpan={6}
                      className="border p-2 border-b-4 border-x-2 text-center"
                    >
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
                  <tr className="bg-white border-b">
                    <td className="border-x-2 p-2">
                      {briefDataCollection[0].block[0].question}
                    </td>
                    <td className="border border-x-2 p-2">
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
                  <tr className="bg-white border-b">
                    <td className="border border-x-2 p-2">
                      {briefDataCollection[0].block[1].question}
                    </td>
                    <td className="border border-x-2 p-2">
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
                  <tr className="bg-white border-b">
                    <td className="border border-x-2 p-2">
                      {briefDataCollection[0].block[2].question}
                    </td>
                    <td className="border border-x-2 p-2">
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
                  <tr className="bg-white border-b">
                    <td className="border border-x-2 p-2">
                      {briefDataCollection[0].block[3].question}
                    </td>
                    <td className="border border-x-2 p-2">
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
                  <tr className="bg-white border-b">
                    <td className="border border-x-2 border-b-2 p-2">
                      {briefDataCollection[0].block[4].question}
                    </td>
                    <td className="border border-x-2 border-b-2 p-2">
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

                  <tr className="bg-white border-b">
                    <td className="border p-2 font-bold border-t-4 border-x-2">{`${briefDataCollection[1].id}. ${briefDataCollection[1].title}`}</td>
                    <td className="border p-2 font-bold border-t-4 border-x-2">{`${briefDataCollection[1].id}. ${briefDataCollection[1].title}`}</td>
                    <td rowSpan={5} className="p-2 border-b-4 border-x-2 text-center">
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
                  <tr className="bg-white border-b">
                    <td className="border-x-2 p-2">
                      {briefDataCollection[1].block[0].question}
                    </td>
                    <td className="border border-x-2 p-2">
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
                  <tr className="bg-white border-b">
                    <td className="border border-x-2 p-2">
                      {briefDataCollection[1].block[1].question}
                    </td>
                    <td className="border border-x-2 p-2">
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
                  <tr className="bg-white border-b">
                    <td className="border border-x-2 p-2">
                      {briefDataCollection[1].block[2].question}
                    </td>
                    <td className="border border-x-2 p-2">
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
                  <tr className="bg-white border-b">
                    <td className="border border-x-2 border-b-2 p-2">
                      {briefDataCollection[1].block[3].question}
                    </td>
                    <td className="border border-x-2 border-b-2 p-2">
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

                  <tr className="bg-white border-b">
                    <td className="border p-2 font-bold border-t-4 border-x-2">{`${briefDataCollection[2].id}. ${briefDataCollection[2].title}`}</td>
                    <td className="border p-2 font-bold border-t-4 border-x-2">{`${briefDataCollection[2].id}. ${briefDataCollection[2].title}`}</td>
                    <td rowSpan={6} className="p-2 border-x-2 text-center">
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
                  <tr className="bg-white border-b">
                    <td className="border-x-2 p-2">
                      {briefDataCollection[2].block[0].question}
                    </td>
                    <td className="border border-x-2 p-2">
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
                  <tr className="bg-white border-b">
                    <td className="border border-x-2 p-2">
                      {briefDataCollection[2].block[1].question}
                    </td>
                    <td className="border border-x-2 p-2">
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
                  <tr className="bg-white border-b">
                    <td className="border border-x-2 p-2">
                      {briefDataCollection[2].block[2].question}
                    </td>
                    <td className="border border-x-2 p-2">
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
                  <tr className="bg-white border-b">
                    <td className="border border-x-2 p-2">
                      {briefDataCollection[2].block[3].question}
                    </td>
                    <td className="border border-x-2 p-2">
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
                </tbody> */}
              </table>
            </div>
          )}
          <div className="flex justify-center">
            <button className="btn-cyan" onClick={saveToDatabase}>
              {t('Save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditBrief
