import { useEffect, useMemo, useRef, useState } from 'react'

import { useTranslation } from 'next-i18next'

import { useRecoilState, useSetRecoilState } from 'recoil'

import useSupabaseClient from 'utils/supabaseClient'

import { toast } from 'react-hot-toast'
import { Switch } from '@headlessui/react'

import { checkedVersesBibleState, isHideAllVersesState } from '../../state/atoms'
import Modal from 'components/Modal'

import { obsCheckAdditionalVerses } from 'utils/helper'
import Pencil from 'public/pencil.svg'
import Check from 'public/check.svg'

function BlindEditor({ config }) {
  const supabase = useSupabaseClient()
  const [isShowFinalButton, setIsShowFinalButton] = useState(false)
  const [translatedVerses, setTranslatedVerses] = useState([])
  const [enabledInputs, setEnabledInputs] = useState([])
  const [enabledIcons, setEnabledIcons] = useState([])
  const [verseObjects, setVerseObjects] = useState([])
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [firstStepRef, setFirstStepRef] = useState({})
  const [isHideAllVerses, setIsHideAllVerses] = useRecoilState(isHideAllVersesState)
  const { t } = useTranslation(['common'])
  const textAreaRef = useRef([])
  const setCheckedVersesBible = useSetRecoilState(checkedVersesBibleState)
  //When it's true - we have 1 block translation and it save to first verse of divided verses
  const isSingleBlockTranslation = config?.config?.is_single_block_translation

  useEffect(() => {
    const _verseObjects = config.reference.verses
    setVerseObjects(_verseObjects)
    const updatedArray = _verseObjects
      .filter((verseObject) => verseObject.verse)
      .map((verseObject) => verseObject.num.toString())
    !isSingleBlockTranslation && setCheckedVersesBible(updatedArray)
    setTranslatedVerses(updatedArray)
    if (!updatedArray.length) {
      return
    }
    const lastNumInUpdatedArray = updatedArray[updatedArray.length - 1]
    const nextIndex = _verseObjects.findIndex(
      (verseObject, index) =>
        verseObject.num.toString() === lastNumInUpdatedArray &&
        index < _verseObjects.length - 1
    )

    if (nextIndex !== -1) {
      setEnabledIcons([_verseObjects[nextIndex + 1].num.toString()])
    } else if (updatedArray.length === _verseObjects.length) {
      setEnabledIcons(['0'])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const filteredVerseObjects = useMemo(() => {
    return isSingleBlockTranslation
      ? verseObjects.filter((_, index) => index === 0)
      : verseObjects
  }, [isSingleBlockTranslation, verseObjects])

  useEffect(() => {
    if (!filteredVerseObjects || !filteredVerseObjects.length) {
      return
    }
    if (filteredVerseObjects[filteredVerseObjects.length - 1].verse) {
      setIsShowFinalButton(
        enabledIcons?.[0] ===
          filteredVerseObjects[filteredVerseObjects.length - 1].num.toString()
      )
    }
  }, [enabledIcons, filteredVerseObjects])

  const updateVerse = (id, text) => {
    setVerseObjects((prev) => {
      prev[id].verse = text.trim()
      return [...prev]
    })
  }

  const sendToDb = async (index) => {
    setTranslatedVerses((prev) => [...prev, filteredVerseObjects[index].num.toString()])

    const res = await supabase.rpc('save_verse', {
      new_verse: filteredVerseObjects[index].verse,
      verse_id: filteredVerseObjects[index].verse_id,
    })
    if (res.error || !res) {
      toast.error(t('SaveFailed') + '. ' + t('CheckInternet'), {
        duration: 8000,
      })
    }
  }

  const saveVerse = (ref) => {
    const { index, currentNumVerse, nextNumVerse, prevNumVerse, isTranslating } = ref
    if ((index !== 0 && !verseObjects[index - 1].verse) || isTranslating) {
      const focusIndex = textAreaRef?.current?.[index - 1] ? index - 1 : index
      textAreaRef?.current?.[focusIndex]?.focus()
      return
    }
    setEnabledIcons((prev) => {
      return [
        ...prev,
        ...(index === 0 ? [currentNumVerse, nextNumVerse] : [nextNumVerse]),
      ].filter((el) => el !== prevNumVerse)
    })
    !isSingleBlockTranslation &&
      setCheckedVersesBible((prev) => [...prev, currentNumVerse])
    setEnabledInputs((prev) =>
      [...prev, currentNumVerse].filter((el) => el !== prevNumVerse)
    )
    if (index === 0) {
      return
    }
    sendToDb(index - 1)
  }

  const handleSaveVerse = (ref) => {
    if (ref.index === 0 && !ref.isTranslating) {
      setIsOpenModal(true)
      setFirstStepRef(ref)
    } else {
      saveVerse(ref)
    }
  }
  return (
    <>
      <div>
        {filteredVerseObjects.map((verseObject, index) => {
          const currentNumVerse = verseObject.num.toString()
          const nextNumVerse =
            index < filteredVerseObjects.length - 1
              ? filteredVerseObjects[index + 1].num.toString()
              : ''
          const prevNumVerse =
            index !== 0 ? filteredVerseObjects[index - 1].num.toString() : ''
          const disabledButton = !(
            (index === 0 && !enabledIcons.length) ||
            enabledIcons.includes(currentNumVerse)
          )
          const isTranslating = enabledInputs.includes(verseObject.num.toString())
          const isTranslated = translatedVerses.includes(currentNumVerse)
          return (
            <div key={verseObject.verse_id} className="flex my-3 items-start">
              <button
                onClick={() =>
                  handleSaveVerse({
                    index,
                    currentNumVerse,
                    nextNumVerse,
                    prevNumVerse,
                    isTranslating,
                  })
                }
                className={`p-3 rounded-2xl ${
                  isTranslating ? 'bg-th-primary-100 cursor-auto' : 'bg-th-secondary-100'
                }`}
                disabled={disabledButton}
              >
                {isTranslated ? (
                  <Check className="w-5 h-5 stroke-2 stroke-th-secondary-300" />
                ) : (
                  <Pencil
                    className={`w-5 h-5 stroke-2 ${
                      disabledButton
                        ? 'stroke-th-secondary-300'
                        : !isTranslating
                        ? 'fill-th-secondary-100'
                        : 'stroke-th-text-secondary-100'
                    }`}
                  />
                )}
              </button>

              {!isSingleBlockTranslation && (
                <div className="mx-4 mt-3">
                  {obsCheckAdditionalVerses(verseObject.num)}
                </div>
              )}
              {isTranslating ? (
                <textarea
                  ref={(el) => (textAreaRef.current[index] = el)}
                  dir={config?.isRtl ? 'rtl' : 'ltr'}
                  autoFocus
                  rows={!isSingleBlockTranslation ? 1 : 10}
                  className={`mt-3 w-full resize-none focus:outline-none focus:inline-none ${
                    isSingleBlockTranslation ? 'border mx-4' : ''
                  }`}
                  onChange={(e) => {
                    e.target.style.height = 'inherit'
                    e.target.style.height = `${e.target.scrollHeight}px`
                    updateVerse(
                      index,
                      e.target.value
                        .replace(/  +/g, ' ')
                        .replace(/ +([\.\,\)\!\?\;\:])/g, '$1')
                        .trim()
                    )
                  }}
                  defaultValue={verseObject.verse ?? ''}
                />
              ) : (
                <div
                  className="mt-3 whitespace-pre-line w-full"
                  dir={config?.isRtl ? 'rtl' : 'ltr'}
                >
                  {verseObject.verse}
                </div>
              )}
            </div>
          )
        })}
        {isShowFinalButton && (
          <button
            onClick={() => {
              setEnabledIcons(['201'])
              setEnabledInputs([])
              sendToDb(filteredVerseObjects.length - 1)
            }}
            className="btn-base bg-th-primary-100 text-th-text-secondary-100 hover:opacity-70"
          >
            {t('Save')}
          </button>
        )}
      </div>
      {isSingleBlockTranslation && (
        <div className="flex items-center gap-2 mt-2">
          <span className="w-auto">{t('HideVerses')}</span>
          <Switch
            checked={isHideAllVerses}
            onChange={() => setIsHideAllVerses((prev) => !prev)}
            className={`${
              isHideAllVerses ? 'bg-th-primary-100' : 'bg-th-secondary-100'
            } relative inline-flex h-6 w-11 items-center rounded-full`}
          >
            <span
              className={`${
                isHideAllVerses ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition`}
            />
          </Switch>
        </div>
      )}
      <Modal isOpen={isOpenModal} closeHandle={() => setIsOpenModal(false)}>
        <div className="flex flex-col gap-7 items-center">
          <div className="text-center text-2xl">{t('AreYouSureWantStartBlind')}</div>
          <div className="flex gap-7 w-1/2">
            <button
              className="btn-secondary flex-1"
              onClick={() => {
                if (isSingleBlockTranslation) {
                  setIsHideAllVerses(true)
                }
                setIsOpenModal(false)
                saveVerse(firstStepRef)
                setTimeout(() => {
                  if (textAreaRef?.current) {
                    textAreaRef.current[0].focus()
                  }
                }, 1000)
              }}
            >
              {t('Yes')}
            </button>
            <button
              className="btn-secondary flex-1"
              onClick={() => setIsOpenModal(false)}
            >
              {t('No')}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default BlindEditor
