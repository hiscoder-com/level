import { useEffect, useState } from 'react'

import { useTranslation } from 'next-i18next'

import { supabase } from 'utils/supabaseClient'

import { useSetRecoilState } from 'recoil'

import AutoSizeTextArea from '../UI/AutoSizeTextArea'

import { checkedVersesBibleState } from '../state/atoms'

import Pencil from 'public/pencil.svg'

function BlindEditor({ config }) {
  const [enabledIcons, setEnabledIcons] = useState([])
  const [enabledInputs, setEnabledInputs] = useState([])
  const [verseObjects, setVerseObjects] = useState([])
  const [isShowFinalButton, setIsShowFinalButton] = useState(false)
  const { t } = useTranslation(['common'])

  const setCheckedVersesBible = useSetRecoilState(checkedVersesBibleState)

  useEffect(() => {
    setVerseObjects(config.reference.verses)
    let updatedArray = []
    const _verseObjects = config.reference.verses
    config.reference.verses.forEach((el) => {
      if (el.verse !== null) {
        updatedArray.push(el.num.toString())
      }
    })
    setCheckedVersesBible(updatedArray)

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
      prev[id].verse = text
      return [...prev]
    })
  }

  const sendToDb = async (index) => {
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
          index < verseObjects.length - 1 ? verseObjects[index + 1].num.toString() : []
        const prevNumVerse = index !== 0 ? verseObjects[index - 1].num.toString() : []
        const disabledButton = !(
          (index === 0 && !enabledIcons.length) ||
          enabledIcons.includes(currentNumVerse)
        )

        return (
          <div key={el.verse_id} data-id={el.num} className="flex my-3">
            <button disabled={disabledButton}>
              <Pencil
                onClick={() => {
                  if (index !== 0 && !verseObjects[index - 1].verse) {
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
                className={`w-4 h-4 mt-1 ${!disabledButton ? 'svg-cyan' : 'svg-gray'}`}
              />
            </button>

            <div className="ml-4">{el.num}</div>
            <AutoSizeTextArea
              disabled={!enabledInputs.includes(el.num.toString())}
              updateVerse={updateVerse}
              index={index}
              verseObject={el}
            />
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
