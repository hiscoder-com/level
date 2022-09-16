import { useEffect, useRef, useState } from 'react'

function AutoSizeTextArea({
  disabled,
  verse,
  value,
  setVerseObject,
  defaultValue,
  onBlur,
}) {
  const [textAreaValue, setTextAreaValue] = useState(null)

  const textareaRef = useRef(null)

  const autoResize = () => {
    textareaRef.current.style.height = 0
    textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
  }

  useEffect(() => {
    autoResize()
  }, [])
  return (
    <textarea
      disabled={disabled}
      ref={textareaRef}
      defaultValue={defaultValue}
      onChange={(e) => setVerseObject({ key: verse, text: e.target.value })}
      onInput={(el) => {
        setTextAreaValue(el.target.value)
        autoResize()
      }}
      onBlur={onBlur}
      type="text"
      placeholder={'_'.repeat(80)}
      value={value}
      className={`resize-none block w-full mx-3 focus:outline-none focus:inline-none focus:bg-white  ${
        textAreaValue || disabled ? '' : 'bg-gray-300'
      }`}
    />
  )
}

export default AutoSizeTextArea
