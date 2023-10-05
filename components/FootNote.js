import { useState, useCallback, useRef, useMemo, useEffect } from 'react'

function FootNote({ props }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const text = props?.children[0]
  const getContentFromString = useCallback((text, pattern) => {
    const match = text.match(pattern)
    return match ? match[1] : null
  }, [])
  const link = getContentFromString(text, /\\fr (.*?) \\ft/)
  const content = getContentFromString(text, /\\ft (.*)/)
  const footnote = useMemo(
    () => (link && content ? link + ': ' + content.replaceAll('\\xt', '') : text),
    [content, link, text]
  )
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  return (
    <>
      <span className="relative" ref={containerRef}>
        <span
          className="py-1 px-2 rounded-full bg-cyan-600 text-white text-xs cursor-pointer"
          onClick={(e) => {
            e.stopPropagation()
            setIsOpen((prev) => !prev)
          }}
        >
          fn
        </span>
        <span
          className={`${
            isOpen ? 'absolute' : 'hidden'
          } left-full top-full p-2 z-5 bg-white rounded-lg border border-cyan-600`}
        >
          {footnote}
        </span>
      </span>
    </>
  )
}

export default FootNote
