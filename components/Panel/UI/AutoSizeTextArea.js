import { useEffect, useRef } from 'react'

function AutoSizeTextArea({
  disabled,
  verse,
  value,
  setVerseObject,
  defaultValue,
  onBlur,
  placeholder,
}) {
  const textareaRef = useRef(null)

  return (
    <textarea
      disabled={disabled}
      ref={textareaRef}
      defaultValue={defaultValue}
      onChange={(e) => setVerseObject({ key: verse, text: e.target.value })}
      onInput={() => {
        textareaRef.current.style.height = 0
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
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
