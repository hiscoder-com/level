import { useState } from 'react'

import ReactMarkdown from 'react-markdown'

import MarkdownExtended from 'components/MarkdownExtended'
import { Placeholder } from '../UI'

import { useGetResource } from 'utils/hooks'

import Close from 'public/close.svg'

function TNTWL({ config, url }) {
  const [item, setItem] = useState(null)
  const { loading, data, error } = useGetResource({ config, url })

  return (
    <>
      {loading ? (
        <Placeholder />
      ) : (
        <>
          {item ? (
            <ToolContent setItem={setItem} item={item} />
          ) : (
            <ToolList setItem={setItem} data={data} />
          )}
        </>
      )}
    </>
  )
}

export default TNTWL

function ToolList({ setItem, data }) {
  return (
    <div className="divide-y divide-gray-800 divide-dashed">
      {data &&
        Object.entries(data).map((el, index) => {
          return (
            <div key={index} className="p-4 flex mx-4">
              <div className="text-2xl">{el[0]}</div>
              <div className="text-gray-700 pl-7">
                <ul>
                  {el[1]?.map((item) => {
                    return (
                      <li
                        key={item.id}
                        className="py-2 cursor-pointer"
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
    <div className="relative p-8">
      <div
        className="absolute top-0 right-0 w-8 pt-3 pr-3 cursor-pointer"
        onClick={() => setItem(null)}
      >
        <Close />
      </div>
      <div className=" font-bold text-xl mb-2">
        <ReactMarkdown>{item.title}</ReactMarkdown>
      </div>
      <MarkdownExtended>{item.text}</MarkdownExtended>
    </div>
  )
}
