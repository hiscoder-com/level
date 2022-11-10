import { useEffect, useState } from 'react'

import ReactMarkdown from 'react-markdown'

import { useTranslation } from 'next-i18next'

import { Placeholder, TNTWLContent } from '../UI'

import { useGetResource, useScroll } from 'utils/hooks'
import { checkLSVal } from 'utils/helper'

function TWL({ config, url, toolName }) {
  const [item, setItem] = useState(null)
  const { loading, data, error } = useGetResource({ config, url })
  return (
    <>
      {loading ? (
        <Placeholder />
      ) : (
        <div className="relative h-full">
          <TNTWLContent setItem={setItem} item={item} />
          <ToolList setItem={setItem} data={data} toolName={toolName} />
        </div>
      )}
    </>
  )
}

export default TWL

function ToolList({ setItem, data, toolName }) {
  const [verses, setVerses] = useState([])
  const [filter, setFilter] = useState(() => {
    return checkLSVal('filter_words', 'disabled', 'string')
  })
  const { scrollId, handleSave } = useScroll({ toolName })

  useEffect(() => {
    localStorage.setItem('filter_words', filter)
  }, [filter])

  useEffect(() => {
    if (data) {
      setVerses(Object.entries(data))
    }
  }, [data])

  return (
    <div className="divide-y divide-gray-800 divide-dashed h-full overflow-auto">
      <div className="text-center">
        {<FilterRepeated filter={filter} setFilter={setFilter} />}
      </div>
      {verses?.map((el, verseIndex) => {
        return (
          <div key={verseIndex} className="p-4 flex mx-4">
            <div className="text-2xl">{el[0]}</div>
            <div className="text-gray-700 pl-7">
              <ul>
                {el[1]?.map((item, index) => {
                  let itemFilter
                  switch (filter) {
                    case 'disabled':
                      itemFilter = false
                      break
                    case 'verse':
                      itemFilter = item.repeatedInVerse
                      break
                    case 'book':
                      itemFilter = item.repeatedInBook
                      break

                    default:
                      break
                  }

                  return (
                    <li
                      key={index}
                      id={'id' + item.id}
                      className={`p-2 cursor-pointer ${
                        itemFilter ? 'text-gray-400' : ''
                      } hover:bg-cyan-50
                      ${scrollId === 'id' + item.id ? 'bg-gray-100' : ''}
                      `}
                      onClick={() => {
                        handleSave(item.id)
                        setItem({ text: item.text, title: item.title })
                      }}
                    >
                      <ReactMarkdown>{item.title}</ReactMarkdown>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function FilterRepeated({ setFilter, filter }) {
  const { t } = useTranslation('common')
  const options = [
    { value: 'verse', name: t('By_verse') },
    { value: 'book', name: t('By_book') },
    { value: 'disabled', name: t('Disabled') },
  ]

  return (
    <div className="flex items-center justify-center">
      <div className="">{t('Filter_repeated_words')}</div>
      <select
        className="input m-2 !w-auto"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      >
        {options?.map((option) => (
          <option value={option.value} key={option.value}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  )
}
