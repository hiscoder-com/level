import { useEffect, useState } from 'react'

function AutoSizeTextArea({
  disabled = false,
  updateVerse,
  index,
  verseObject,
  defaultValue = '_'.repeat(50),
}) {
  const [startValue, setStartValue] = useState()

  useEffect(() => {
    setStartValue(verseObject.verse)
  }, [verseObject.verse])

  return (
    <div
      key={index}
      contentEditable={!disabled}
      defaultValue={defaultValue}
      suppressContentEditableWarning={true}
      onBlur={(el) => {
        console.log(el)
        updateVerse(index, el.target.innerText.trim())
      }}
      className={`block w-full mx-3 focus:outline-none focus:inline-none focus:bg-white  ${
        verseObject.verse || disabled ? '' : 'bg-gray-300'
      }`}
      // eslint-disable-next-line prettier/prettier
    >{startValue}</div>
  )
}

export default AutoSizeTextArea
