import { useState } from 'react'

function CustomComboBox({ topics, selectedTopic, onChange }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleItemClick = (link) => {
    onChange(link)
    setIsOpen(false)
  }

  const renderNestedList = (items) => {
    return items.map((item) => (
      <li
        key={item.link}
        onClick={() => handleItemClick(item.link)}
        className={`m-2 cursor-pointer p-2 hover:bg-gray-100 ${
          selectedTopic === item.link ? 'bg-gray-200 font-bold' : ''
        } truncate`}
      >
        {item.title}
      </li>
    ))
  }

  const selectedTitle =
    topics.find((topic) => topic.link === selectedTopic)?.title || 'Select a topic'

  return (
    <div className="relative">
      <div
        className="h-10 w-full cursor-pointer truncate rounded border border-gray-300 p-2"
        onClick={() => setIsOpen(!isOpen)}
        title={selectedTitle}
      >
        {selectedTitle}
      </div>
      {isOpen && (
        <div className="absolute left-0 z-10 mt-1 max-h-60 w-full overflow-auto border border-gray-300 bg-white">
          <ul className="list-none">
            {topics.length > 0 ? (
              renderNestedList(topics)
            ) : (
              <li className="p-2 text-gray-500">No topics found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

export default CustomComboBox
