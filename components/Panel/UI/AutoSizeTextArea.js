import { useEffect, useState } from 'react'

function AutoSizeTextArea({ disabled = false, updateVerse, index, verseObject }) {
  const [startValue, setStartValue] = useState(false)

  useEffect(() => {
    if (!startValue || disabled) {
      setStartValue(verseObject.verse?.trim())
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
      className={`block w-full mx-3 focus:outline-none focus:inline-none whitespace-pre-line focus:bg-white  ${
        verseObject.verse || disabled ? '' : 'bg-gray-300'
      }`}
      // eslint-disable-next-line prettier/prettier
    >{startValue}</div>
  )
}

export default AutoSizeTextArea
