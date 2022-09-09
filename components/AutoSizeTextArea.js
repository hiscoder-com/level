import { useEffect, useRef } from 'react'

function AutoSizeTextArea({
  disabled,
  verse,
  value,
  setValue,
  defaultValue,
  rows,
  placeholder,
}) {
  const textareaRef = useRef(null)

  const textAreaChange = (e) => {
    setValue({ key: verse, text: e.target.value })
  }
  useAutosize({ textareaRef, value })
  return (
    <textarea
      disabled={disabled}
      ref={textareaRef}
      defaultValue={defaultValue}
      onChange={(e) => {
        textAreaChange(e)
      }}
      type="text"
      rows={rows}
      placeholder={placeholder}
      className="resize-none block w-full px-3 rounded transition ease-in-out m-0 focus:outline-none focus:inline-none focus:bg-none"
    >
      {value}
    </textarea>
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
