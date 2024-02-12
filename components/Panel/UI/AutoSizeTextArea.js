import { useEffect, useState } from 'react'

function AutoSizeTextArea({ updateVerse, index, verseObject, isRtl, disabled = false }) {
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
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`block w-full mx-3 focus:outline-none focus:inline-none whitespace-pre-line focus:bg-th-secondary-10 ${
        verseObject.verse || disabled ? '' : 'bg-th-secondary-100'
      }`}
      // eslint-disable-next-line prettier/prettier
    >
      {startValue}
    </div>
  )
}

export default AutoSizeTextArea
