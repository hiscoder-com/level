import { useRouter } from 'next/router'

import ReactMarkdown from 'react-markdown'

import { useGetResource } from 'utils/hooks'
import { Placeholder } from '../UI'

import { Disclosure } from '@headlessui/react'

function TQ({ config, url }) {
  const { loading, data, error } = useGetResource({ config, url })
  return (
    <>
      {loading ? (
        <Placeholder />
      ) : (
        <ToolList data={data} viewAll={config?.resource?.stepOption} />
      )}
    </>
  )
}

export default TQ

function ToolList({ data, viewAll }) {
  let uniqueVerses = new Set()
  const reduceQuestions = (verse) => {
    uniqueVerses.add(verse)
    if (Object.keys(data).length === uniqueVerses.size) {
      console.log('все вопросы просмотрены!') //TODO тут надо взять шаг step  и поставить условие - если на таком-то шаге то сеттер чекбокса этого шага сделай значение в условии
    }
  }
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
                        <ToolContent
                          item={item}
                          reduceQuestions={() => reduceQuestions(el[0])}
                          viewAll={viewAll}
                        />
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

function ToolContent({ item, reduceQuestions, viewAll }) {
  return (
    <Disclosure>
      <Disclosure.Button
        className="text-left w-fit"
        onClick={viewAll === 'view-all' && reduceQuestions}
      >
        <ReactMarkdown>{item.title}</ReactMarkdown>
      </Disclosure.Button>
      <Disclosure.Panel className="text-gray-800 w-fit py-4">
        <ReactMarkdown>{item.text}</ReactMarkdown>
      </Disclosure.Panel>
    </Disclosure>
  )
}
