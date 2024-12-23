import { useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import axios from 'axios'
import { useTranslation } from 'next-i18next'
import toast from 'react-hot-toast'

import BriefEditQuestions from 'components/BriefEditQuestions'
import ButtonLoading from 'components/ButtonLoading'
import SwitchLoading from 'components/Panel/UI/SwitchLoading'
import UpdateField from 'components/UpdateField'

import { getBriefName } from 'utils/helper'
import { useGetBrief, useProject } from 'utils/hooks'
import useSupabaseClient from 'utils/supabaseClient'

import Pencil from 'public/icons/editor-pencil.svg'

function BriefBlock({ access, title = false }) {
  const supabase = useSupabaseClient()
  const [briefDataCollection, setBriefDataCollection] = useState([])
  const [briefName, setBriefName] = useState('Brief')
  const [editableMode, setEditableMode] = useState(false)
  const [isEditingBriefName, setIsEditingBriefName] = useState(false)
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
    if (brief?.name) {
      setBriefName(brief.name)
    }
  }, [brief?.name])

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

  const handleSwitchToggleBrief = async () => {
    if (brief) {
      const toggleValue = brief.is_enable
      try {
        await axios.put(`/api/briefs/switch/${project?.id}/is_enable`, {
          is_enable: !toggleValue,
        })
        mutate()
        toast.success(
          t(
            `project-edit:BriefToggleisenableSuccess${
              !toggleValue ? 'Enabled' : 'Disabled'
            }`
          )
        )
      } catch (error) {
        console.error(error)
        toast.error(t(`project-edit:BriefToggleError`))
        return await Promise.reject()
      }
    }
  }

  const handleSaveBriefName = () => {
    if (briefName && brief?.id) {
      axios
        .put(`/api/briefs/${brief?.id}/name`, {
          name: briefName,
        })
        .then(mutate)
        .catch((err) => {
          toast.error(t('SaveFailed'))
          console.log(err)
        })
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

  const titleBrief = useMemo(() => {
    return getBriefName(briefName, t('project-edit:EditBriefTitle'))
  }, [briefName, t])
  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-start justify-end sm:justify-between">
        {title && (
          <div className="flex items-center gap-2">
            {!isEditingBriefName ? (
              <h3 className="text-lg font-bold md:text-xl">{titleBrief}</h3>
            ) : (
              <input
                value={briefName}
                onChange={(e) => setBriefName(e.target.value)}
                className="input-primary"
              />
            )}
            {!access ? null : isEditingBriefName ? (
              <ButtonLoading
                className="btn-primary relative"
                onClick={() => {
                  handleSaveBriefName()
                  setIsEditingBriefName(false)
                }}
                isLoading={isSaving}
              >
                {t('Save')}
              </ButtonLoading>
            ) : (
              <button className="btn-primary" onClick={() => setIsEditingBriefName(true)}>
                <Pencil className="inline w-5" />
              </button>
            )}
          </div>
        )}
        <div className="flex flex-col items-end justify-end gap-7 text-sm md:text-base lg:flex-row">
          {access && (
            <div className="flex items-center">
              <span className="mr-3">
                {t(`project-edit:${brief?.is_enable ? 'DisableBrief' : 'EnableBrief'}`)}
              </span>
              <SwitchLoading
                id="brief-switch"
                checked={brief?.is_enable || false}
                onChange={handleSwitchToggleBrief}
              />
            </div>
          )}
          <div className="flex items-center">
            <span className="mr-3">{t('Detailed')}</span>
            <SwitchLoading
              id="detail-switch"
              disabled={editableMode}
              checked={!hidden}
              withDelay={true}
              onChange={() => {
                setHidden((prev) => !prev)
              }}
            />
          </div>
          {access && (
            <div className="flex items-center">
              <span className="mr-3">{t('project-edit:EditableMode')}</span>
              <SwitchLoading
                id="editable-mode-switch"
                checked={editableMode}
                withDelay={true}
                onChange={(value) => setEditableMode(value)}
              />
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
            <div className="mb-4 flex w-full flex-col gap-4">
              <ul className="ml-4 list-decimal space-y-7 text-sm text-th-text-primary md:text-base">
                {briefDataCollection.map((briefItem, index) => {
                  return (
                    <li key={index} className="space-y-3 font-bold">
                      <div className="center flex justify-between gap-7">
                        <p>{briefItem.title}</p>
                      </div>
                      <div className={hidden ? 'hidden' : 'space-y-7'}>
                        {briefItem.block?.map((questionAndAnswerPair, blockIndex) => {
                          return (
                            <div className="font-normal" key={blockIndex}>
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
                        <p className={hidden ? 'hidden' : 'mt-7 text-lg'}>
                          {t('project-edit:Summary')}
                        </p>
                        <UpdateField
                          value={briefItem.resume}
                          updateValue={updateCollection}
                          index={index}
                          access={access}
                          className="input-primary font-normal"
                          editable={access}
                          textarea
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
                      className={`h-7 w-${width}/12 mt-4 rounded-full bg-th-secondary-100`}
                    ></div>
                  ))}
                </div>
              </div>
            </>
          )}
          {access && (
            <ButtonLoading
              className="btn-primary relative"
              onClick={() => saveToDatabase(briefDataCollection, true)}
              isLoading={isSaving}
            >
              {t('Save')}
            </ButtonLoading>
          )}
        </div>
      )}
    </div>
  )
}

export default BriefBlock
