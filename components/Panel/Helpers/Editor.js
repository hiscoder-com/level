import { useEffect, useRef, useState } from 'react'

import { useRecoilValue, useRecoilState } from 'recoil'

import { checkedVersesBibleState, translatedVersesState } from '../state/atoms'

import AutoSizeTextArea from '../UI/AutoSizeTextArea'

function Editor({ config }) {
  const [verseObject, setVerseObject] = useState(null)

  const [verseObjects, setVerseObjects] = useState()
  const versesRef = useRef(null)

  useEffect(() => {
    if (!versesRef?.current) return
    const _verses = Array.from(versesRef?.current?.children).map((el) => {
      return { verse: el.id, text: Array.from(el.children)[1]?.value }
    })

    setVerseObjects(_verses)
  }, [verseObject])
  return (
    <>
      {config?.resource?.stepOption === 'draft' ? (
        <EditorExtended config={config} />
      ) : (
        <div ref={versesRef}>
          {config?.resource?.verses?.map((el, index) => (
            <div key={el.id} id={el.verse} className="flex my-3">
              <div>{el.verse}</div>
              <AutoSizeTextArea
                verseObject={verseObject}
                defaultValue={el.text}
                setVerseObject={setVerseObject}
                verse={el.verse}
                placeholder={'_'.repeat(50)}
                onChange={(e) => console.log('first')}
              />
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default Editor

function EditorExtended({ config }) {
  const [verseObject, setVerseObject] = useState(null)
  const [verseObjects, setVerseObjects] = useState()
  const [translatedVerses, setTranslatedVerses] = useRecoilState(translatedVersesState)
  const versesRef = useRef(null)
  const checkedVersesBible = useRecoilValue(checkedVersesBibleState)

  const translatedVersesKeys = translatedVerses.map((el) => el.key)

  const sendToDb = (verse, index) => {
    setTranslatedVerses((prev) => [...prev, verseObject])
    console.log(`save to supabase verse ${verse}`, verseObject)
    if (index === config?.resource?.verses.length - 1) {
      console.log(
        'Можно переходить на другой шаг и сделать активным чекбокса "Выполнено"'
      )
      console.log(
        'весь отрезок стихов можно взять здесь',
        verseObjects,
        ' или здесь',
        translatedVerses
      )
    }
    setVerseObject(null)
  }

  const onBlurTextArea = (e, verse) => {
    console.log('в стихе ' + verse + ' изменился текст: ' + e.target.value)
    console.log('сделать видимой кнопку SAVE')
  }

  useEffect(() => {
    if (!versesRef?.current) return
    const _verses = Array.from(versesRef?.current?.children).map((el) => {
      return { verse: el.id, text: Array.from(el.children)[2]?.value }
    })
    setVerseObjects(_verses)
  }, [translatedVerses])

  return (
    <div ref={versesRef}>
      {config?.resource?.verses.map((el, index) => (
        <div key={el.id} id={el.verse} className="flex my-3 items-start">
          <input
            type="checkBox"
            disabled={
              !checkedVersesBible.includes(el.verse) ||
              translatedVersesKeys.includes(el.verse) ||
              !verseObject
            }
            className="mt-1"
            onChange={() => sendToDb(el.verse, index)}
            checked={translatedVersesKeys.includes(el.verse)}
          />
          <div className="ml-4">{el.verse}</div>
          <AutoSizeTextArea
            disabled={
              !checkedVersesBible.includes(el.verse) ||
              translatedVersesKeys.includes(el.verse)
            }
            onBlur={(e) => onBlurTextArea(e, el.verse)}
            verse={el.verse}
            value={translatedVerses[index]?.text}
            setVerseObject={setVerseObject}
            verseObject={verseObject}
            placeholder={'_'.repeat(50)}
          />
        </div>
      ))}
    </div>
  )
}
