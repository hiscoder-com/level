import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import toast, { Toaster } from 'react-hot-toast'
import { useTranslation } from 'next-i18next'

import { Switch } from '@headlessui/react'

import axios from 'axios'

import { useGetBrief, useProject } from 'utils/hooks'
import { useCurrentUser } from 'lib/UserContext'
import { supabase } from 'utils/supabaseClient'

import UpdateField from 'components/UpdateField'

function BriefBlock({ access }) {
  const [briefDataCollection, setBriefDataCollection] = useState([])
  const [editableMode, setEditableMode] = useState(false)
  const [hidden, setHidden] = useState(true)

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
    if (briefDataCollection.length == 0 && brief?.data_collection) {
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
      .from('briefs')
      .on('UPDATE', (payload) => {
        setBriefDataCollection(payload.new.data_collection)
      })
      .subscribe()

    return () => {
      briefUpdates.unsubscribe()
    }
  }, [])

  const handleSwitch = () => {
    if (brief) {
      axios.defaults.headers.common['token'] = user?.access_token
      axios
        .put(`/api/briefs/switch/${project?.id}`, { is_enable: !brief?.is_enable })
        .then(mutate)
        .catch(console.log)
    }
  }
  const removeBlockByIndex = (index, array, setter) => {
    if (array.length > 1) {
      setter(array.filter((_, idx) => index !== idx))
    }
  }
  const addBlock = (array, setter) => {
    const newBlock = {
      block: [
        {
          answer: '',
          question: 'question',
        },
      ],
      id: 'id' + Math.random().toString(16).slice(2),
      resume: '',
      title: 'block',
    }
    const _array = [...array]
    _array.push(newBlock)
    setter(_array)
  }
  const addQuestionIntoBlock = (index, array, setter) => {
    const question = {
      answer: '',
      question: 'question',
    }
    const _array = [...array]
    _array[index].block.push(question)
    setter(_array)
  }

  const removeQuestionFromeBlock = (blockIndex, questionIndex, array, setter) => {
    if (array[blockIndex].block.length > 1) {
      const _array = [...array]
      _array[blockIndex] = {
        ...array[blockIndex],
        block: array[blockIndex].block.filter((_, index) => index !== questionIndex),
      }
      setter(_array)
    }
  }

  const updateCollection = ({ ref, index, array, setter }) => {
    const _array = array.map((obj, idx) => {
      if (index === idx) {
        return { ...obj, ...ref }
      }
      return obj
    })
    setter(_array)
  }

  const updateResume = ({ ref, index, array, name, setter }) => {
    updateCollection({ ref, index, array, name, setter })
    setTimeout(saveToDatabase, 1000)
  }
  const updateQuestions = ({ ref, index, array, setter, subIndex }) => {
    const _array = [...array]
    _array[index].block[subIndex] = { ..._array[index].block[subIndex], ...ref }
    setter(_array)
  }

  return (
    <div className="card">
      <div className="flex flex-col gap-7">
        <div className="flex flex-col sm:flex-row justify-between gap-7">
          <h3 className="text-xl font-bold">{t('project-edit:EditBriefTitle')}</h3>
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
        <div className="flex justify-between">
          <div className="flex">
            <span className="mr-3">{t('Detailed')}</span>
            <Switch
              disabled={editableMode}
              checked={!hidden}
              onChange={() => {
                setHidden((prev) => !prev)
              }}
              className={`${
                !hidden && !editableMode ? 'bg-cyan-600' : 'bg-gray-200'
              } relative inline-flex h-7 w-12 items-center rounded-full`}
            >
              <span
                className={`${
                  !hidden ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-5 w-5 transform rounded-full bg-white transition`}
              />
            </Switch>
          </div>
          <div className="flex">
            <span className="mr-3">{t('EditableMode')}</span>
            <Switch
              checked={editableMode}
              onChange={() => {
                setHidden(false)
                setEditableMode((prev) => !prev)
              }}
              className={`${
                editableMode ? 'bg-cyan-600' : 'bg-gray-200'
              } relative inline-flex h-7 w-12 items-center rounded-full`}
            >
              <span
                className={`${
                  editableMode ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-5 w-5 transform rounded-full bg-white transition`}
              />
            </Switch>
          </div>
        </div>

        {briefDataCollection.length > 0 ? (
          <div className="flex flex-col gap-4 w-full mb-4">
            <ul className="list-decimal ml-4 ext-base text-slate-900 space-y-7">
              {briefDataCollection.map((briefItem, index) => {
                return (
                  <li key={index} className="space-y-7">
                    <div className="flex gap-7 center justify-between">
                      {editableMode ? (
                        <UpdateField
                          value={briefItem.title}
                          update={updateResume}
                          array={briefDataCollection}
                          setArray={setBriefDataCollection}
                          type={'title'}
                          index={index}
                        />
                      ) : (
                        <p className="">{briefItem.title}</p>
                      )}
                      {editableMode && (
                        <button
                          disabled={briefDataCollection.length < 2}
                          className={'btn-primary'}
                          onClick={() =>
                            removeBlockByIndex(
                              index,
                              briefDataCollection,
                              setBriefDataCollection
                            )
                          }
                        >
                          Удалить блок вопросов
                        </button>
                      )}
                    </div>

                    <div className={hidden ? 'hidden' : ''}>
                      {briefItem.block?.map((questionAndAnswerPair, blockIndex) => {
                        return (
                          <div key={blockIndex} className="">
                            <div className="flex items-center gap-7">
                              <div className="flex gap-7 center justify-between">
                                {editableMode ? (
                                  <UpdateField
                                    value={questionAndAnswerPair.question}
                                    update={updateQuestions}
                                    array={briefDataCollection}
                                    setArray={setBriefDataCollection}
                                    subIndex={blockIndex}
                                    type={'question'}
                                    index={index}
                                  />
                                ) : (
                                  <p className="">{questionAndAnswerPair.question}</p>
                                )}
                              </div>
                              {editableMode && (
                                <button
                                  disabled={briefDataCollection[index].block.length < 2}
                                  className={'btn-primary'}
                                  onClick={() =>
                                    removeQuestionFromeBlock(
                                      index,
                                      blockIndex,
                                      briefDataCollection,
                                      setBriefDataCollection
                                    )
                                  }
                                >
                                  Удалить вопрос
                                </button>
                              )}
                            </div>

                            {!editableMode && (
                              <>
                                <UpdateField
                                  value={questionAndAnswerPair.answer}
                                  update={updateQuestions}
                                  array={briefDataCollection}
                                  setArray={setBriefDataCollection}
                                  type={'answer'}
                                  index={index}
                                  access={access}
                                  subIndex={blockIndex}
                                  t={t}
                                />
                              </>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    {editableMode && (
                      <button
                        className="btn-primary w-fit"
                        onClick={() =>
                          addQuestionIntoBlock(
                            index,
                            briefDataCollection,
                            setBriefDataCollection
                          )
                        }
                      >
                        Добавить вопрос
                      </button>
                    )}
                    {!editableMode && (
                      <div className="">
                        <p className={hidden ? 'hidden' : 'text-lg font-bold'}>
                          {t('project-edit:Summary')}
                        </p>
                        <UpdateField
                          value={briefItem.resume}
                          update={updateCollection}
                          array={briefDataCollection}
                          setarray={setBriefDataCollection}
                          type={'resume'}
                          index={index}
                          access={access}
                          t={t}
                        />
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ) : (
          <>
            <div role="status" className="w-full animate-pulse">
              <div className="flex flex-col">
                <div className="h-7 w-3/12 mt-4 bg-gray-200 rounded-full"></div>
                <div className="h-7 w-7/12 mt-4 bg-gray-200 rounded-full"></div>
                <div className="h-7 w-3/12 mt-4 bg-gray-200 rounded-full"></div>
                <div className="h-7 w-4/12 mt-4 bg-gray-200 rounded-full"></div>
                <div className="h-7 w-9/12 mt-4 bg-gray-200 rounded-full"></div>
                <div className="h-7 w-6/12 mt-4 bg-gray-200 rounded-full"></div>
                <div className="h-7 w-3/12 mt-4 bg-gray-200 rounded-full"></div>
                <div className="h-7 w-10/12 mt-4 bg-gray-200 rounded-full"></div>
                <div className="h-7 w-8/12 mt-4 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </>
        )}
        {editableMode && (
          <button
            className="btn-primary w-fit"
            onClick={() => addBlock(briefDataCollection, setBriefDataCollection)}
          >
            Добавить блок вопросов
          </button>
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

export default BriefBlock
