import { useEffect, useRef } from 'react'

function AutoSizeTextArea({
  disabled,
  verse,
  value,
  setVerseObject,
  defaultValue,
  rows,
  placeholder,
  onChange,
}) {
  const textareaRef = useRef(null)
  const filterText = (verses) => {
    return verses.map((verse) => {
      return { ...verse, text: verse.text.trim() }
    })
  }
  const textAreaChange = (e) => {
    setVerseObject({ key: verse, text: filterText(e.target.value) })
  }
  useAutosize({ textareaRef, value })
  return (
    <textarea
      disabled={disabled}
      ref={textareaRef}
      defaultValue={defaultValue}
      onBlur={(e) => e.target.value.trim()}
      onChange={(e) => {
        onChange(e), textAreaChange(e)
      }}
      type="text"
      rows={rows}
      placeholder={placeholder}
      value={value?.text}
      className="resize-none block w-full px-3 focus:outline-none focus:inline-none focus:bg-none"
    />
  )
}

export default AutoSizeTextArea

function useAutosize({ textareaRef, value }) {
  useEffect(() => {
    if (textareaRef && textareaRef.current) {
      textareaRef.current.style.height = '0px'
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = scrollHeight + 'px'
    }
  }, [value])
}
