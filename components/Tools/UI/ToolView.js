import ReactMarkdown from 'react-markdown'
import { useState } from 'react'

import Close from '../../../public/close.svg'

export default function ToolView({ data }) {
  const [item, setItem] = useState(null)
  return (
    <>
      {item ? (
        <ToolContent setItem={setItem} item={item} />
      ) : (
        <ToolList setItem={setItem} data={data} />
      )}
    </>
  )
}

function ToolList({ setItem, data }) {
  return (
    <>
      {data &&
        Object.entries(data).map((el, index) => {
          return (
            <div
              key={index}
              className="border-2 w-min-20 p-4 border-gray-500 mb-4 flex items-center mx-4"
            >
              <div className="text-5xl">{el[0]}</div>
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
    </>
  )
}

function ToolContent({ setItem, item }) {
  return (
    <div className="relative border-2 border-gray-500 p-8 mx-4">
      <div
        className="absolute top-0 right-0 w-8 pt-3 pr-3 cursor-pointer"
        onClick={() => setItem(null)}
      >
        <Close />
      </div>
      <div className=" font-bold text-xl mb-2">
        <ReactMarkdown>{item.title}</ReactMarkdown>
      </div>
      <ReactMarkdown>{item.text}</ReactMarkdown>
    </div>
  )
}
