import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import toast, { Toaster } from 'react-hot-toast'
import { useTranslation } from 'next-i18next'

import { Switch } from '@headlessui/react'

import axios from 'axios'

import { useGetBrief, useProject } from 'utils/hooks'
import { useCurrentUser } from 'lib/UserContext'
import useSupabaseClient from 'utils/supabaseClient'

import BriefResume from './BriefResume'
import BriefAnswer from './BriefAnswer'

function Brief({ access }) {
  const supabase = useSupabaseClient()

  const [briefDataCollection, setBriefDataCollection] = useState('')

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
      .then()
      .catch((err) => {
        toast.error(t('SaveFailed'))
        console.log(err)
      })
  }

  useEffect(() => {
    const briefUpdates = supabase
      .channel('public:briefs')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'briefs' },
        (payload) => setBriefDataCollection(payload.new.data_collection)
      )
      .subscribe()

    return () => {
      supabase.removeChannel(briefUpdates)
    }
  }, [supabase])

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
  const handleSwitch = () => {
    if (brief) {
      axios.defaults.headers.common['token'] = user?.access_token
      axios
        .put(`/api/briefs/switch/${project?.id}`, { is_enable: !brief?.is_enable })
        .then(mutate)
        .catch(console.log)
    }
  }
  return (
    <div className="card">
      <div className="flex flex-col gap-7">
        <div className="flex justify-between">
          <h3 className="text-2xl font-bold">{t('project-edit:EditBriefTitle')}</h3>
          <div>
            {access && (
              <div className="flex">
                <span className="mr-3">
                  {t(`project-edit:${brief?.is_enable ? 'DisableBrief' : 'EnableBrief'}`)}
                </span>

                <Switch
                  checked={brief?.is_enable}
                  onChange={handleSwitch}
                  className={`${
                    brief?.is_enable ? 'bg-cyan-600' : 'bg-gray-200'
                  } relative inline-flex h-7 w-12 items-center rounded-full`}
                >
                  <span
                    className={`${
                      brief?.is_enable ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-5 w-5 transform rounded-full bg-white transition`}
                  />
                </Switch>
              </div>
            )}
          </div>
        </div>
        {briefDataCollection && (
          <div className="flex flex-col md:flex-row gap-4 w-full mb-4">
            <div className="w-full md:w-1/3">
              <p className="mb-4 text-xl font-bold">{t('Questions')}</p>
              <div className="text-sm bg-white">
                {briefDataCollection.map((briefItem, index) => {
                  const questionTitle = `${briefItem.id}. ${briefItem.title}`
                  return (
                    <div
                      key={index}
                      className={`${
                        briefItem.id >= briefDataCollection.length
                          ? ''
                          : 'border-b-2 mb-2 pb-2 mr-2 leading-6'
                      }`}
                    >
                      <p className="text-lg font-bold">{questionTitle}</p>
                      <ul className="list-disc px-4">
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
            </div>
            <div className="w-full md:w-1/3">
              <p className="mb-4 text-xl font-bold">{t('project-edit:Answers')}</p>
              <div className="text-sm bg-white">
                {briefDataCollection.map((briefItem, index) => {
                  const questionTitle = `${briefItem.id}. ${briefItem.title}`
                  return (
                    <div
                      key={index}
                      className={`${
                        briefItem.id >= briefDataCollection.length
                          ? ''
                          : 'border-b-2 mb-2 pb-2 mr-2'
                      }`}
                    >
                      <p className="text-lg font-bold">{questionTitle}</p>
                      <ul className="list-disc px-4">
                        {briefItem.block?.map((questionAndAnswerPair, blockIndex) => {
                          return (
                            <li className="flex flex-nowrap leading-6" key={blockIndex}>
                              <BriefAnswer
                                access={access}
                                saveToDatabase={saveToDatabase}
                                objQA={questionAndAnswerPair}
                                updateObjQA={updateObjQA}
                                blockIndex={blockIndex}
                                briefItem={briefItem}
                                index={index}
                                t={t}
                              />
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="w-full md:w-1/3">
              <p className="mb-4 text-xl font-bold">{t('TranslationGoal')}</p>
              <div className="text-sm text-gray-500 bg-white">
                {briefDataCollection.map((briefItem, index) => {
                  return (
                    <div className="flex flex-nowrap leading-6 py-2" key={index}>
                      -&nbsp;
                      <BriefResume
                        access={access}
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
            </div>
          </div>
        )}

        {access && (
          <div>
            <button
              className="btn-primary text-xl"
              onClick={() => {
                saveToDatabase()
                toast.success(t('SaveSuccess'))
              }}
            >
              {t('Save')}
            </button>
            <Toaster />
          </div>
        )}
      </div>
    </div>
  )
}

export default Brief
