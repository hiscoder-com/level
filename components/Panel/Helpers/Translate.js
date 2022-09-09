import { useEffect, useRef, useState } from 'react'
import AutoSizeTextArea from '../UI/AutoSizeTextArea'

const filterText = (verses) => {
  return verses.map((verse) => {
    return { ...verse, text: verse.text.trim() }
  })
}

function Translate({ config }) {
  const [value, setValue] = useState()
  const [verses, setVerses] = useState()
  const formRef = useRef(null)

  const onChangeArea = (e, verse) => {
    console.log('в стихе ' + verse + ' изменился текст: ' + e.target.value)
  }

  useEffect(() => {
    if (!formRef?.current) return
    const _verses = Array.from(formRef?.current?.children).map((el) => {
      return { verse: el.id, text: Array.from(el.children)[1]?.value }
    })

    setVerses(filterText(_verses))
  }, [value])
  return (
    <div ref={formRef}>
      {config?.resource?.verses.map((el) => (
        <div key={el.id} id={el.verse} className="flex my-3">
          <div>{el.verse}</div>
          <AutoSizeTextArea
            disabled={el.noneeditable}
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
