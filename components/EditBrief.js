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
    <div className="mx-auto max-w-7xl divide-y-2 divide-gray-400">
      <div className="pb-4">
        <div className="h3">
          <Link href={`/projects/${project?.code}/edit`}>
            <a className="underline text-blue-700">« {project?.title}</a>
          </Link>
          <p className="uppercase text-center text-gray-700">
            {t('project-edit:EditBriefTitle')}
          </p>
        </div>

        <div className="mt-2 md:mt-5">
          {briefDataCollection && (
            <div className="flex-col w-full gap-4 mb-4 flex md:flex-row">
              <div className="md:w-1/3">
                <p className="font-bold text-center mb-4 text-gray-700">
                  {t('Questions')}
                </p>
                <div className="h-3 rounded-t-lg bg-white"></div>
                <div className="h-[61vh] px-4 text-sm text-gray-500 overflow-auto bg-white">
                  {briefDataCollection.map((briefItem, index) => {
                    const questionTitle = `${briefItem.id}. ${briefItem.title}`
                    return (
                      <div
                        key={index}
                        className={`${
                          briefItem.id >= briefDataCollection.length
                            ? ''
                            : 'border-b-2 mb-2 pb-2 leading-6'
                        }`}
                      >
                        <p className="font-bold">{questionTitle}</p>
                        {briefItem.block?.map((questionAndAnswerPair, blockIndex) => {
                          return (
                            <li key={blockIndex}>{questionAndAnswerPair.question}</li>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
                <div className="h-3 rounded-b-lg bg-white"></div>
              </div>
              <div className="md:w-1/3">
                <p className="text-gray-700 font-bold text-center mb-4">
                  {t('project-edit:Answers')}
                </p>
                <div className="h-3 rounded-t-lg bg-white"></div>
                <div className="h-[61vh] px-4 text-sm text-gray-500 overflow-auto bg-white">
                  {briefDataCollection.map((briefItem, index) => {
                    const questionTitle = `${briefItem.id}. ${briefItem.title}`
                    return (
                      <div
                        key={index}
                        className={`${
                          briefItem.id >= briefDataCollection.length
                            ? ''
                            : 'border-b-2 mb-2 leading-6'
                        }`}
                      >
                        <p className="font-bold">{questionTitle}</p>
                        <ul className="list-disc">
                          {briefItem.block?.map((questionAndAnswerPair, blockIndex) => {
                            const answer = (
                              <TextareaAutosize
                                onBlur={() => {
                                  setTimeout(() => saveToDatabase(), 2000)
                                }}
                                disabled
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
                                className="leading-3 outline-none w-full resize-none"
                              />
                            )

                            return <li key={blockIndex}>{answer}</li>
                          })}
                        </ul>
                      </div>
                    )
                  })}
                </div>
                <div className="h-3 rounded-b-lg bg-white"></div>
              </div>
              <div className="md:w-1/3">
                <p className="font-bold text-center mb-4 text-gray-700">
                  {t('PurposeTranslation')}
                </p>
                <div className="h-3 rounded-t-lg bg-white"></div>
                <div className="h-[61vh] px-4 text-sm text-gray-500 overflow-auto bg-white">
                  <ul className="list-disc">
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

                      return <li key={index}>{resume}</li>
                    })}
                  </ul>
                </div>
                <div className="h-3 rounded-b-lg bg-white"></div>
              </div>
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
