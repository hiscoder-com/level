import { useEffect, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'

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
              <table className="table-fixed w-full my-6 text-sm text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="py-3 px-6">{t('Questions')}</th>
                    <th className="py-3 px-6">{t('project-edit:Answers')}</th>
                    <th className="py-3 px-6">{t('PurposeTranslation')}</th>
                  </tr>
                </thead>
                <tbody>
                  {briefDataCollection.map((briefItem, index) => {
                    const resume = (
                      <TextareaAutosize
                        onBlur={() => {
                          setTimeout(() => saveToDatabase(), 2000)
                        }}
                        defaultValue={briefItem.resume}
                        onChange={(e) => {
                          setBriefDataCollection((prev) => {
                            prev[index] = {
                              ...prev[index],
                              resume: e.target.value,
                            }
                            return prev
                          })
                        }}
                        className="p-2 outline-none w-full resize-none"
                      />
                    )
                    const questionTitle = `${briefItem.id}. ${briefItem.title}`

                    return (
                      <>
                        <tr key={index} className="bg-white border-t-4">
                          <td className="border p-2 font-bold border-b-2 border-x-2">
                            {questionTitle}
                          </td>
                          <td className="border p-2 font-bold border-b-2 border-x-2">
                            {questionTitle}
                          </td>
                          <td
                            rowSpan={briefItem.block.length + 1}
                            className="border p-2 text-center"
                          >
                            {resume}
                          </td>
                        </tr>
                        {briefItem.block?.map((questionAndAnswerPair, blockIndex) => {
                          const answer = (
                            <TextareaAutosize
                              onBlur={() => {
                                setTimeout(() => saveToDatabase(), 2000)
                              }}
                              defaultValue={questionAndAnswerPair.answer}
                              onChange={(e) => {
                                setBriefDataCollection((prev) => {
                                  const newBriefItemBlock = briefItem.block
                                  newBriefItemBlock[blockIndex] = {
                                    ...questionAndAnswerPair,
                                    answer: e.target.value,
                                  }
                                  prev[index] = {
                                    ...prev[index],
                                    block: newBriefItemBlock,
                                  }
                                  return prev
                                })
                              }}
                              className="outline-none w-full resize-none"
                            />
                          )
                          return (
                            <tr key={blockIndex} className="bg-white border-b">
                              <td className="border p-2 border-x-2">
                                {questionAndAnswerPair.question}
                              </td>
                              <td className="p-2 border-x-2">{answer}</td>
                            </tr>
                          )
                        })}
                      </>
                    )
                  })}
                </tbody>
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
