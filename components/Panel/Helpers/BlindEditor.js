import { useEffect, useState } from 'react'

import { useTranslation } from 'next-i18next'

import { useSetRecoilState } from 'recoil'

import { supabase } from 'utils/supabaseClient'

import { checkedVersesBibleState } from '../state/atoms'

import Pencil from 'public/pencil.svg'
import Check from 'public/check.svg'

function BlindEditor({ config }) {
  const [isShowFinalButton, setIsShowFinalButton] = useState(false)
  const [translatedVerses, setTranslatedVerses] = useState([])
  const [enabledInputs, setEnabledInputs] = useState([])
  const [enabledIcons, setEnabledIcons] = useState([])
  const [verseObjects, setVerseObjects] = useState([])
  const { t } = useTranslation(['common'])

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
  }

  return (
    <div>
      {verseObjects.map((el, index) => {
        const currentNumVerse = el.num.toString()
        const nextNumVerse =
          index < verseObjects.length - 1 ? verseObjects[index + 1].num.toString() : ''
        const prevNumVerse = index !== 0 ? verseObjects[index - 1].num.toString() : ''
        const disabledButton = !(
          (index === 0 && !enabledIcons.length) ||
          enabledIcons.includes(currentNumVerse)
        )
        const isTranslating = enabledInputs.includes(el.num.toString())
        const isTranslated = translatedVerses.includes(currentNumVerse)
        return (
          <div key={el.verse_id} className="flex my-3 items-start">
            <button
              onClick={() => {
                if ((index !== 0 && !verseObjects[index - 1].verse) || isTranslating) {
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
              }}
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

            <div className="mx-4">{el.num}</div>
            {isTranslating ? (
              <textarea
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
                defaultValue={el.verse ?? ''}
              />
            ) : (
              <div className="whitespace-pre-line">{el.verse}</div>
            )}
          </div>
        )
      })}
      {isShowFinalButton && (
        <button
          onClick={() => {
            setEnabledIcons(['0'])
            setEnabledInputs([])
            sendToDb(verseObjects.length - 1)
          }}
          className="btn-white"
        >
          {t('Save')}
        </button>
      )}
    </div>
  )
}

export default BlindEditor
