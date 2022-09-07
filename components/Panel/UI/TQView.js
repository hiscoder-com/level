import ReactMarkdown from 'react-markdown'

import { Disclosure } from '@headlessui/react'

export default function TQView({ data }) {
  return (
    <>
      <ToolList data={data} />
    </>
  )
}

function ToolList({ data }) {
  return (
    <div className="divide-y divide-gray-800 divide-dashed">
      {data &&
        Object.entries(data).map((el) => {
          return (
            <div key={el[0]} className="p-4 flex mx-4">
              <div className="text-2xl">{el[0]}</div>
              <div className="text-gray-700 pl-7">
                <ul>
                  {el[1]?.map((item) => {
                    return (
                      <li key={item.id} className="py-2">
                        <ToolContent item={item} />
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

function ToolContent({ item }) {
  return (
    <Disclosure>
      <Disclosure.Button className="text-left w-fit">
        <ReactMarkdown>{item.title}</ReactMarkdown>
      </Disclosure.Button>
      <Disclosure.Panel className="text-gray-800 w-fit py-4">
        <ReactMarkdown>{item.text}</ReactMarkdown>
      </Disclosure.Panel>
    </Disclosure>
  )
}
