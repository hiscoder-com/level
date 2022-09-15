import { useEffect, useRef } from 'react'

function AutoSizeTextArea({
  disabled,
  verse,
  value,
  setVerseObject,
  defaultValue,
  onBlur,
  verseObject,
  placeholder,
}) {
  const textareaRef = useRef(null)

  useAutosize({ textareaRef, verseObject })

  return (
    <textarea
      disabled={disabled}
      ref={textareaRef}
      defaultValue={defaultValue}
      onChange={(e) => {
        setVerseObject({ key: verse, text: e.target.value })
      }}
      onBlur={onBlur}
      type="text"
      placeholder={placeholder}
      value={value}
      className="resize-none block w-full px-3 focus:outline-none focus:inline-none focus:bg-none"
    />
  )
}

export default AutoSizeTextArea

function useAutosize({ textareaRef, verseObject }) {
  useEffect(() => {
    if (textareaRef && textareaRef.current) {
      textareaRef.current.style.height = '0px'
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = scrollHeight + 'px'
    }
  }, [verseObject])
}
