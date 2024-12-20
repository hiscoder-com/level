import { useEffect, useRef, useState } from 'react'

function DropdownSearch({
  options,
  value,
  onChange,
  placeholder,
  searchQuery,
  setSearchQuery,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <input
        type="text"
        value={searchQuery}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className="w-full rounded border border-gray-300 p-3"
      />
      {isOpen && (
        <div className="absolute z-10 mt-1 max-h-44 w-full overflow-auto rounded border border-gray-300 bg-white shadow-lg">
          {options.length > 0 ? (
            options.map((option, index) => (
              <div
                key={`${option.link}-${index}`}
                onClick={() => {
                  onChange(option.link)
                  setIsOpen(false)
                }}
                className={`cursor-pointer px-4 py-2 hover:bg-gray-100 ${
                  value === option.link ? 'bg-gray-200' : ''
                }`}
              >
                {`${'\u00A0'.repeat((option.depth || 0) * 4)}${option.title}`}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">There are no matches</div>
          )}
        </div>
      )}
    </div>
  )
}

export default DropdownSearch
