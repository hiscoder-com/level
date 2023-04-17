import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import toast, { Toaster } from 'react-hot-toast'
import { useTranslation } from 'next-i18next'

import axios from 'axios'

import { useGetBrief, useProject } from 'utils/hooks'
import { useCurrentUser } from 'lib/UserContext'
import { supabase } from 'utils/supabaseClient'

import BriefResume from './BriefResume'
import BriefAnswer from './BriefAnswer'

function EditBrief() {
  const [briefDataCollection, setBriefDataCollection] = useState('')
  const [highLevelAccess, setHighLevelAccess] = useState(false)

  const {
    query: { code },
  } = useRouter()
  const { user } = useCurrentUser()
  const [project] = useProject({ token: user?.access_token, code })

  const { t } = useTranslation(['common', 'project-edit'])

  const [brief, { mutate }] = useGetBrief({
    token: user?.access_token,
    project_id: project?.id,
  })

  useEffect(() => {
    if (!briefDataCollection && brief?.data_collection) {
      setBriefDataCollection(brief.data_collection)
    }
  }, [brief, briefDataCollection])

  const saveToDatabase = () => {
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .put(`/api/briefs/${project?.id}`, {
        data_collection: briefDataCollection,
      })
      .then(mutate)
      .catch((err) => {
        toast.error(t('SaveFailed'))
        console.log(err)
      })
  }

  useEffect(() => {
    const getLevel = async () => {
      const level = await supabase.rpc('authorize', {
        user_id: user?.id,
        project_id: project.id,
      })
      if (level?.data) {
        setHighLevelAccess(['admin', 'coordinator'].includes(level.data))
      }
    }
    if (user?.id && project?.id) {
      getLevel()
    }
  }, [user?.id, project?.id])

  useEffect(() => {
    const briefUpdates = supabase
      .from('briefs')
      .on('UPDATE', (payload) => {
        setBriefDataCollection(payload.new.data_collection)
      })
      .subscribe()

    return () => {
      briefUpdates.unsubscribe()
    }
  }, [])

  const updateBrief = (text, index) => {
    setBriefDataCollection((prev) => {
      prev[index] = {
        ...prev[index],
        resume: text,
      }
      return prev
    })
  }

  const updateObjQA = (text, briefItem, blockIndex, objQA, index) => {
    setBriefDataCollection((prev) => {
      const updateBriefItemBlock = briefItem.block
      updateBriefItemBlock[blockIndex] = {
        ...objQA,
        answer: text,
      }
      prev[index] = {
        ...prev[index],
        block: updateBriefItemBlock,
      }
      return prev
    })
  }

  return (
    <div className="container divide-y-2 divide-gray-400">
      <div className="pb-4">
        <div className="h3">
          <Link
            href={`${
              highLevelAccess
                ? `/projects/${project?.code}/edit`
                : `/projects/${project?.code}/`
            }`}
          >
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
                        <ul className="list-disc px-3">
                          {briefItem.block?.map((questionAndAnswerPair, blockIndex) => {
                            return (
                              <li key={blockIndex}>{questionAndAnswerPair.question}</li>
                            )
                          })}
                        </ul>
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
                            : 'border-b-2 mb-2 pb-2'
                        }`}
                      >
                        <p className="font-bold">{questionTitle}</p>
                        {briefItem.block?.map((questionAndAnswerPair, blockIndex) => {
                          return (
                            <div className="flex flex-nowrap leading-6" key={blockIndex}>
                              -&nbsp;
                              <BriefAnswer
                                highLevelAccess={highLevelAccess}
                                saveToDatabase={saveToDatabase}
                                objQA={questionAndAnswerPair}
                                updateObjQA={updateObjQA}
                                blockIndex={blockIndex}
                                briefItem={briefItem}
                                index={index}
                                t={t}
                              />
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
                <div className="h-3 rounded-b-lg bg-white"></div>
              </div>
              <div className="md:w-1/3">
                <p className="font-bold text-center mb-4 text-gray-700">
                  {t('TranslationGoal')}
                </p>
                <div className="h-3 rounded-t-lg bg-white"></div>
                <div className="h-[61vh] px-4 text-sm text-gray-500 overflow-auto bg-white">
                  {briefDataCollection.map((briefItem, index) => {
                    return (
                      <div className="flex flex-nowrap leading-6 py-2" key={index}>
                        -&nbsp;
                        <BriefResume
                          highLevelAccess={highLevelAccess}
                          saveToDatabase={saveToDatabase}
                          objResume={briefItem.resume}
                          updateBrief={updateBrief}
                          index={index}
                          t={t}
                        />
                      </div>
                    )
                  })}
                </div>
                <div className="h-3 rounded-b-lg bg-white"></div>
              </div>
            </div>
          )}
          {highLevelAccess && (
            <div className="flex justify-center">
              <button
                className="btn-cyan"
                onClick={() => {
                  saveToDatabase()
                  toast.success(t('SaveSuccess'))
                }}
              >
                {t('Save')}
              </button>
              <Toaster
                toastOptions={{
                  style: {
                    marginTop: '-6px',
                    color: '#6b7280',
                  },
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EditBrief
