import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import toast from 'react-hot-toast'

import { useTranslation } from 'next-i18next'

import { Switch } from '@headlessui/react'

import axios from 'axios'

import UpdateField from 'components/UpdateField'
import BriefEditQuestions from 'components/BriefEditQuestions'
import ButtonSave from 'components/ButtonSave'

import { useGetBrief, useProject } from 'utils/hooks'

import useSupabaseClient from 'utils/supabaseClient'

function BriefBlock({ access, title = false }) {
  const supabase = useSupabaseClient()

  const [briefDataCollection, setBriefDataCollection] = useState([])
  const [editableMode, setEditableMode] = useState(false)
  const [hidden, setHidden] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const {
    query: { code },
  } = useRouter()
  const [project] = useProject({ code })

  const { t } = useTranslation(['common', 'project-edit'])

  const [brief, { mutate }] = useGetBrief({
    project_id: project?.id,
  })

  useEffect(() => {
    if (briefDataCollection.length == 0 && brief?.data_collection) {
      setBriefDataCollection(brief.data_collection)
    }
  }, [brief, briefDataCollection])

  const saveToDatabase = (briefDataCollection, isSaveFinal) => {
    setIsSaving(true)
    axios
      .put(`/api/briefs/${project?.id}`, {
        data_collection: briefDataCollection,
      })

      .then(() => {
        isSaveFinal && toast.success(t('SaveSuccess'))
        mutate()
      })
      .catch((err) => {
        toast.error(t('SaveFailed'))
        console.log(err)
      })
      .finally(() => setIsSaving(false))
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

  const handleSwitch = () => {
    if (brief) {
      axios
        .put(`/api/briefs/switch/${project?.id}`, { is_enable: !brief?.is_enable })
        .then(mutate)
        .catch(console.log)
    }
  }

  const updateCollection = ({ value, index }) => {
    const _array = briefDataCollection.map((obj, idx) => {
      if (index === idx) {
        return { ...obj, resume: value }
      }
      return obj
    })
    setBriefDataCollection(_array)
    saveToDatabase(_array)
  }

  const updateQuestions = ({ value, index, subIndex }) => {
    const _array = [...briefDataCollection]
    _array[index].block[subIndex] = { ..._array[index].block[subIndex], answer: value }
    setBriefDataCollection(_array)
    saveToDatabase(_array)
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="flex justify-end sm:justify-between">
        {title && (
          <h3 className="text-lg md:text-xl font-bold">
            {t('project-edit:EditBriefTitle')}
          </h3>
        )}

        <div className="flex flex-col items-end lg:flex-row gap-7 justify-end text-sm md:text-base">
          {access && (
            <div className="flex items-center">
              <span className="mr-3">
                {t(`project-edit:${brief?.is_enable ? 'DisableBrief' : 'EnableBrief'}`)}
              </span>

              <Switch
                checked={brief?.is_enable || false}
                onChange={handleSwitch}
                className={`${
                  brief?.is_enable ? 'bg-th-primary' : 'bg-th-primary-background'
                } relative inline-flex h-7 w-12 items-center rounded-full`}
              >
                <span
                  className={`${
                    brief?.is_enable ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-5 w-5 transform rounded-full bg-th-secondary-background transition`}
                />
              </Switch>
            </div>
          )}
          <div className="flex items-center">
            <span className="mr-3">{t('Detailed')}</span>
            <Switch
              disabled={editableMode}
              checked={!hidden}
              onChange={() => {
                setHidden((prev) => !prev)
              }}
              className={`${
                !hidden && !editableMode ? 'bg-th-primary' : 'bg-th-primary-background'
              } relative inline-flex h-7 w-12 items-center rounded-full`}
            >
              <span
                className={`${
                  !hidden ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-5 w-5 transform rounded-full bg-th-secondary-background transition`}
              />
            </Switch>
          </div>
          {access && (
            <div className="flex items-center">
              <span className="mr-3">{t('project-edit:EditableMode')}</span>
              <Switch
                checked={editableMode}
                onChange={() => {
                  setEditableMode((prev) => !prev)
                }}
                className={`${
                  editableMode ? 'bg-th-primary' : 'bg-th-primary-background'
                } relative inline-flex h-7 w-12 items-center rounded-full`}
              >
                <span
                  className={`${
                    editableMode ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-5 w-5 transform rounded-full bg-th-secondary-background transition`}
                />
              </Switch>
            </div>
          )}
        </div>
      </div>
      {editableMode ? (
        <BriefEditQuestions
          customBriefQuestions={briefDataCollection}
          setCustomBriefQuestions={setBriefDataCollection}
        />
      ) : (
        <div className="space-y-7">
          {briefDataCollection.length > 0 ? (
            <div className="flex flex-col gap-4 w-full mb-4">
              <ul className="list-decimal ml-4 text-sm md:text-base text-th-primary-text space-y-7">
                {briefDataCollection.map((briefItem, index) => {
                  return (
                    <li key={index} className="space-y-3 font-bold">
                      <div className="flex gap-7 center justify-between">
                        <p className="font-bold">{briefItem.title}</p>
                      </div>
                      <div className={hidden ? 'hidden' : 'space-y-7'}>
                        {briefItem.block?.map((questionAndAnswerPair, blockIndex) => {
                          return (
                            <div key={blockIndex}>
                              <div className="space-y-3">
                                <p>{questionAndAnswerPair.question}</p>
                                <UpdateField
                                  value={questionAndAnswerPair.answer}
                                  updateValue={updateQuestions}
                                  index={index}
                                  access={access}
                                  subIndex={blockIndex}
                                  className="input-primary"
                                  editable={access}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      <div className="space-y-7">
                        <p className={hidden ? 'hidden' : 'text-lg font-bold mt-7'}>
                          {t('project-edit:Summary')}
                        </p>
                        <UpdateField
                          value={briefItem.resume}
                          updateValue={updateCollection}
                          index={index}
                          access={access}
                          className="input-primary"
                          editable={access}
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : (
            <>
              <div role="status" className="w-full animate-pulse">
                <div className="flex flex-col">
                  {[3, 7, 3, 4, 9, 6, 3, 10, 8].map((width, index) => (
                    <div
                      key={index}
                      className={`h-7 w-${width}/12 mt-4 bg-th-primary-background rounded-full`}
                    ></div>
                  ))}
                </div>
              </div>
            </>
          )}

          {access && (
            <div>
              <ButtonSave
                className="btn-primary"
                onClick={() => saveToDatabase(briefDataCollection, true)}
                isSaving={isSaving}
              >
                {t('Save')}
              </ButtonSave>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default BriefBlock
