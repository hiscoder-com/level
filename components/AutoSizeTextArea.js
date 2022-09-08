import { useEffect, useRef } from 'react'

function AutoSizeTextArea({
  value,
  setValue,
  defaultValue,
  type,
  rows,
  className,
  placeholder,
}) {
  const textareaRef = useRef(null)

  const textAreaChange = (e) => {
    setValue(e.target.value)
  }
  useEffect(() => {
    if (textareaRef && textareaRef.current) {
      textareaRef.current.style.height = '0px'
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = scrollHeight + 'px'
    }
  }, [value])
  return (
    <textarea
      ref={textareaRef}
      defaultValue={defaultValue}
      onChange={textAreaChange}
      type={type}
      rows={rows}
      className={className}
      placeholder={placeholder}
    >
      {value}
    </textarea>
  )
}

export default AutoSizeTextArea
