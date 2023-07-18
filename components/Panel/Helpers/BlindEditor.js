import { useEffect, useRef, useState } from 'react'

import { useTranslation } from 'next-i18next'

import { useSetRecoilState } from 'recoil'

import useSupabaseClient from 'utils/supabaseClient'

import { toast, Toaster } from 'react-hot-toast'

import { checkedVersesBibleState } from '../state/atoms'
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
  const { t } = useTranslation(['common'])
  const textAreaRef = useRef([])

  const setCheckedVersesBible = useSetRecoilState(checkedVersesBibleState)

  useEffect(() => {
    setVerseObjects(config.reference.verses)
    let updatedArray = []
    const _verseObjects = config.reference.verses
    config.reference.verses.forEach((el) => {
      if (el.verse) {
        updatedArray.push(el.num.toString())
      }
    })
    setCheckedVersesBible(updatedArray)
    setTranslatedVerses(updatedArray)
    if (!updatedArray.length) {
      return
    }
    if (updatedArray.length === _verseObjects.length) {
      setEnabledIcons(['0'])
    } else {
      for (let index = 0; index < _verseObjects.length; index++) {
        if (
          _verseObjects[index].num.toString() === updatedArray[updatedArray.length - 1] &&
          index < _verseObjects.length - 1
        ) {
          setEnabledIcons([_verseObjects[index + 1].num.toString()])
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!verseObjects || !verseObjects.length) {
      return
    }
    if (verseObjects[verseObjects.length - 1].verse) {
      setIsShowFinalButton(
        enabledIcons?.[0] === verseObjects[verseObjects.length - 1].num.toString()
      )
    }
  }, [enabledIcons, verseObjects])

  const updateVerse = (id, text) => {
    setVerseObjects((prev) => {
      prev[id].verse = text.trim()
      return [...prev]
    })
  }

  const sendToDb = async (index) => {
    setTranslatedVerses((prev) => [...prev, verseObjects[index].num.toString()])
    const res = await supabase.rpc('save_verse', {
      new_verse: verseObjects[index].verse,
      verse_id: verseObjects[index].verse_id,
    })
    if (res.error || !res) {
      toast.error(t('SaveFailed') + '. ' + t('PleaseCheckInternetConnection'), {
        duration: 8000,
      })
      console.log(res)
    }
  }
  const saveVerse = (ref) => {
    const { index, currentNumVerse, nextNumVerse, prevNumVerse, isTranslating } = ref
    if ((index !== 0 && !verseObjects[index - 1].verse) || isTranslating) {
      if (textAreaRef?.current?.[index - 1]) {
        textAreaRef?.current[index - 1].focus()
      } else {
        textAreaRef?.current[index].focus()
      }
      return
    }

    setEnabledIcons((prev) => {
      return [
        ...prev,
        ...(index === 0 ? [currentNumVerse, nextNumVerse] : [nextNumVerse]),
      ].filter((el) => el !== prevNumVerse)
    })
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
        {verseObjects.map((verseObject, index) => {
          const currentNumVerse = verseObject.num.toString()
          const nextNumVerse =
            index < verseObjects.length - 1 ? verseObjects[index + 1].num.toString() : ''
          const prevNumVerse = index !== 0 ? verseObjects[index - 1].num.toString() : ''
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
                className={`${isTranslating ? 'btn-cyan' : 'btn-white'}`}
                disabled={disabledButton}
              >
                {isTranslated ? (
                  <Check className="w-4 h-4 stroke-2" />
                ) : (
                  <Pencil
                    className={`w-5 h-5 stroke-2 ${
                      disabledButton
                        ? 'fill-gray-200'
                        : !isTranslating
                        ? 'fill-cyan-600'
                        : 'fill-white'
                    }`}
                  />
                )}
              </button>

              <div className="mx-4">{obsCheckAdditionalVerses(verseObject.num)}</div>
              {isTranslating ? (
                <textarea
                  ref={(el) => (textAreaRef.current[index] = el)}
                  autoFocus
                  rows={1}
                  className="resize-none focus:outline-none focus:inline-none w-full"
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
                <div className="whitespace-pre-line">{verseObject.verse}</div>
              )}
            </div>
          )
        })}
        {isShowFinalButton && (
          <button
            onClick={() => {
              setEnabledIcons(['201'])
              setEnabledInputs([])
              sendToDb(verseObjects.length - 1)
            }}
            className="btn-white"
          >
            {t('Save')}
          </button>
        )}
        <Toaster />
      </div>
      <Modal isOpen={isOpenModal} closeHandle={() => setIsOpenModal(false)}>
        <div className="flex flex-col gap-7 items-center">
          <div className="text-center text-2xl">{t('AreYouSureWantStartBlind')}</div>
          <div className="flex gap-7 w-1/2">
            <button
              className="btn-secondary flex-1"
              onClick={() => {
                setIsOpenModal(false)
                saveVerse(firstStepRef)
                setTimeout(() => {
                  if (textAreaRef?.current) {
                    textAreaRef?.current[0].focus()
                  }
                }, 1000)
              }}
            >
              {t('Yes')}
            </button>
            <button
              className="btn-secondary flex-1"
              onClick={() => {
                setIsOpenModal(false)
              }}
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
