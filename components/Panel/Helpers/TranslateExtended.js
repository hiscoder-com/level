import { useEffect, useRef, useState } from 'react'
import AutoSizeTextArea from '../UI/AutoSizeTextArea'
import { useRecoilValue, useRecoilState } from 'recoil'

import { checkBible, checkTranslate } from '../state/atoms'

function Translate({ config }) {
  const [value, setValue] = useState(null)
  const [verses, setVerses] = useState()
  const [_checkTranslate, setCheckTranslate] = useRecoilState(checkTranslate)

  const formRef = useRef(null)
  const _checkBible = useRecoilValue(checkBible)
  const onChangeArea = (e, verse) => {
    console.log('в стихе ' + verse + ' изменился текст: ' + e.target.value)
    console.log('сделать видимой кнопку SAVE')
  }
  const sendToDb = (verse, index) => {
    console.log('save to supabase', value)
    if (index === config?.resource?.verses.length - 1) {
      console.log(
        'Можно переходить на другой шаг и сделать активным чекбокса "Выполнено"'
      )
    }
    setValue(null)
    setCheckTranslate((prev) => {
      return [...prev, verse]
    })
  }
  useEffect(() => {
    if (!formRef?.current) return
    const _verses = Array.from(formRef?.current?.children).map((el) => {
      return { verse: el.id, text: Array.from(el.children)[2]?.value }
    })
    setVerses(_verses)
  }, [value])
  return (
    <div ref={formRef}>
      {config?.resource?.verses.map((el, index) => (
        <div key={el.id} id={el.verse} className="flex my-3 items-start">
          <input
            type="checkBox"
            disabled={
              !_checkBible.includes(el.verse) ||
              _checkTranslate.includes(el.verse) ||
              !value
            }
            className="mt-1"
            onChange={() => sendToDb(el.verse, index)}
          />
          <div className="ml-4">{el.verse}</div>
          <AutoSizeTextArea
            disabled={
              !_checkBible.includes(el.verse) || _checkTranslate.includes(el.verse)
            }
            verse={el.verse}
            value={value}
            defaultValue={el.text}
            setValue={setValue}
            placeholder={'_'.repeat(50)}
            onChange={(e) => onChangeArea(e, el.verse)}
          />
        </div>
      ))}
    </div>
  )
}

export default Translate
