import { useEffect, useRef, useState } from 'react'

import { useRecoilValue, useRecoilState } from 'recoil'

import AutoSizeTextArea from '../UI/AutoSizeTextArea'

import { checkedVersesBibleState, translatedVersesState } from '../state/atoms'

function Translate({ config }) {
  const [verseObject, setVerseObject] = useState(null)
  const [verses, setVerses] = useState()
  const [translatedVerses, setTranslatedVerses] = useRecoilState(translatedVersesState)
  const formRef = useRef(null)
  const checkedVersesBible = useRecoilValue(checkedVersesBibleState)

  const translatedVersesKeys = translatedVerses.map((el) => el.key)

  const onChangeTextArea = (e, verse) => {
    console.log('в стихе ' + verse + ' изменился текст: ' + e.target.value)
    console.log('сделать видимой кнопку SAVE')
  }

  const sendToDb = (verse, index) => {
    setTranslatedVerses((prev) => [...prev, verseObject])
    console.log(`save to supabase verse ${verse}`, verseObject)

    if (index === config?.resource?.verses.length - 1) {
      console.log(
        'Можно переходить на другой шаг и сделать активным чекбокса "Выполнено"'
      )
      console.log(
        'весь отрезок стихов можно взять здесь',
        verses,
        ' или здесь',
        translatedVerses
      )
    }
    setVerseObject(null)
  }

  useEffect(() => {
    if (!formRef?.current) return
    const _verses = Array.from(formRef?.current?.children).map((el) => {
      return { verse: el.id, text: Array.from(el.children)[2]?.value }
    })
    setVerses(_verses)
  }, [verseObject])

  return (
    <div ref={formRef}>
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
            verse={el.verse}
            value={translatedVerses[index]}
            setVerseObject={setVerseObject}
            placeholder={'_'.repeat(50)}
            onChange={(e) => onChangeTextArea(e, el.verse)}
          />
        </div>
      ))}
    </div>
  )
}

export default Translate
