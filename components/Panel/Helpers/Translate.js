import { useEffect, useRef, useState } from 'react'

import AutoSizeTextArea from '../UI/AutoSizeTextArea'

function Translate({ config }) {
  const [verseObject, setVerseObject] = useState(null)

  const [verseObjects, setVerseObjects] = useState()
  const formRef = useRef(null)

  const onChangeArea = (e, verse) => {
    console.log('в стихе ' + verse + ' изменился текст: ' + e.target.value)
  }
  useEffect(() => {
    if (!formRef?.current) return
    const _verses = Array.from(formRef?.current?.children).map((el) => {
      return { verse: el.id, text: Array.from(el.children)[1]?.value }
    })

    setVerseObjects(_verses)
  }, [verseObject])
  return (
    <div ref={formRef}>
      {config?.resource?.verses.map((el, index) => (
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
  )
}

export default Translate
