import { useEffect, useState } from 'react'

function AutoSizeTextArea({ updateVerse, index, verseObject, disabled = false }) {
  const [startValue, setStartValue] = useState(false)
  useEffect(() => {
    if (startValue === false || disabled) {
      setStartValue(verseObject.verse ? verseObject.verse.trim() : false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verseObject.verse])

  return (
    <div
      key={index}
      contentEditable={!disabled}
      suppressContentEditableWarning={true}
      onBlur={(el) => {
        updateVerse(index, el.target.innerText.trim())
      }}
      onInput={(e) => {
        if (['historyUndo', 'historyRedo'].includes(e.nativeEvent.inputType)) {
          updateVerse(index, e.target.innerText.trim())
        }
      }}
      className={`focus:inline-none mx-3 block w-full whitespace-pre-line focus:bg-th-secondary-10 focus:outline-none ${
        verseObject.verse || disabled ? '' : 'bg-th-secondary-100'
      }`}
    >
      {startValue}
    </div>
  )
}

export default AutoSizeTextArea
