import { useState } from 'react'

function CustomComboBox({ topics, selectedTopic, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleItemClick = (link) => {
    onChange(link)
    setIsOpen(false)
  }

  const filteredTopics = topics.filter((topic) =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const renderNestedList = (items) => {
    return items.map((item) => (
      <li
        key={item.link}
        style={{ paddingLeft: `${item.depth * 20}px` }}
        onClick={() => handleItemClick(item.link)}
        className={`m-2 cursor-pointer p-2 hover:bg-gray-100 ${
          selectedTopic === item.link ? 'bg-gray-200 font-bold' : ''
        }`}
      >
        <span>{item.title}</span>
      </li>
    ))
  }

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search topics"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full rounded border border-gray-300 p-2"
        onClick={() => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <div className="absolute left-0 right-0 z-10 mt-1 max-h-60 overflow-auto border border-gray-300 bg-white">
          <ul className="list-none">
            {filteredTopics.length > 0 ? (
              renderNestedList(filteredTopics)
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
