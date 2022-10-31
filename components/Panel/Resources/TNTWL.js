import { useEffect, useState } from 'react'

import ReactMarkdown from 'react-markdown'

import { useTranslation } from 'next-i18next'

import MarkdownExtended from 'components/MarkdownExtended'
import { Placeholder } from '../UI'

import { useGetResource } from 'utils/hooks'

import Close from 'public/close.svg'

function TNTWL({ config, url }) {
  const [item, setItem] = useState(null)
  const { loading, data, error } = useGetResource({ config, url })
  const type = url.slice(-3) === 'twl' ? 'twl' : 'tn'
  return (
    <>
      {loading ? (
        <Placeholder />
      ) : (
        <div className="relative h-full">
          <ToolContent setItem={setItem} item={item} />
          <ToolList setItem={setItem} data={data} type={type} />
        </div>
      )}
    </>
  )
}

export default TNTWL

function ToolList({ setItem, data, type }) {
  const { t } = useTranslation('common')
  const [intro, setIntro] = useState([])
  const [verses, setVerses] = useState([])
  const [filter, setFilter] = useState('disabled')
  console.log(filter)

  useEffect(() => {
    if (data) {
      const { intro, ...verses } = data
      intro && setIntro(intro)
      verses && setVerses(Object.entries(verses))
    }
  }, [data])
  return (
    <div className="divide-y divide-gray-800 divide-dashed h-full overflow-auto">
      <div className="justify-center flex">
        {type === 'twl' ? (
          <FilterRepeated filter={filter} setFilter={setFilter} />
        ) : (
          intro.map((el) => (
            <div
              onClick={() => setItem({ text: el.text, title: t(el.title) })}
              className="mx-2  btn-white my-2"
              key={el.id}
            >
              {t(el.title)}
            </div>
          ))
        )}
      </div>
      {data &&
        verses.map((el, index) => {
          return (
            <div key={index} className="p-4 flex mx-4">
              <div className="text-2xl">{el[0]}</div>
              <div className="text-gray-700 pl-7">
                <ul>
                  {el[1]?.map((item) => {
                    let itemFilter
                    switch (filter) {
                      case 'disabled':
                        itemFilter = false
                        break
                      case 'chunk':
                        itemFilter = item.repeatedInChunk
                        break
                      case 'verse':
                        itemFilter = item.repeatedInVerse
                        break

                      default:
                        break
                    }
                    return (
                      <li
                        key={item.id}
                        className={`py-2 cursor-pointer ${
                          itemFilter ? 'text-gray-400' : ''
                        }`}
                        onClick={() => setItem({ text: item.text, title: item.title })}
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

function ToolContent({ setItem, item }) {
  return (
    <div
      className={`absolute top-0 bottom-0 bg-white overflow-auto left-0 right-0 p-8 ${
        item ? '' : 'hidden'
      }`}
    >
      <div
        className="absolute top-0 right-0 w-8 pt-3 pr-3 cursor-pointer"
        onClick={() => setItem(null)}
      >
        <Close />
      </div>
      <div className=" font-bold text-xl mb-2">
        <ReactMarkdown>{item?.title}</ReactMarkdown>
      </div>
      <MarkdownExtended>{item?.text}</MarkdownExtended>
    </div>
  )
}

import React from 'react'
import { RadioGroup } from '@headlessui/react'

function FilterRepeated({ setFilter, filter }) {
  const options = [
    { value: 'verse', name: 'By verse' },
    { value: 'chunk', name: 'By chunk' },
    { value: 'disabled', name: 'Disabled' },
  ]

  return (
    <RadioGroup value={filter} onChange={setFilter}>
      <RadioGroup.Label>Filter</RadioGroup.Label>
      {options.map((option) => {
        return (
          <RadioGroup.Option key={option.value} value={option.value}>
            {({ checked }) => (
              <span className={checked ? 'bg-blue-200' : ''}>{option.name}</span>
            )}
          </RadioGroup.Option>
        )
      })}
    </RadioGroup>
  )
}
