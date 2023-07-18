import ReactMarkdown from 'react-markdown'

import { Disclosure } from '@headlessui/react'

import { Placeholder } from '../UI'

import { useGetResource, useScroll } from 'utils/hooks'

function TQ({ config, url, toolName }) {
  const { isLoading, data } = useGetResource({ config, url })
  return (
    <>
      {isLoading ? (
        <Placeholder />
      ) : (
        <QuestionList
          data={data}
          viewAll={config?.resource?.viewAllQuestions}
          toolName={toolName}
          isLoading={isLoading}
        />
      )}
    </>
  )
}

export default TQ

function QuestionList({ data, viewAll, toolName, isLoading }) {
  let uniqueVerses = new Set()
  const reduceQuestions = (title) => {
    uniqueVerses.add(title)
    if (Object.values(data).flat().length === uniqueVerses.size) {
      console.log('все вопросы просмотрены!') //TODO это для проверки просмотра всех вопросов
    }
  }

  const { highlightId, handleSaveScroll } = useScroll({
    toolName,
    isLoading,
    idPrefix: 'idtq',
  })

  return (
    <div className="divide-y divide-dashed divide-gray-800">
      {data &&
        Object.keys(data)?.map((key) => {
          return (
            <div key={key} className="flex mx-4 p-4" id={'idtq' + key}>
              <div className="text-2xl">{key}</div>
              <div className="pl-7 text-gray-700">
                <ul>
                  {data[key]?.map((item) => {
                    return (
                      <li
                        key={item.id}
                        id={'id' + item.id}
                        onClick={() => handleSaveScroll(key, item.id)}
                        className="py-2"
                      >
                        <Answer
                          item={item}
                          reduceQuestions={() => reduceQuestions(item.title)}
                          viewAll={viewAll}
                          highlightId={highlightId}
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

function Answer({ item, reduceQuestions, viewAll, highlightId }) {
  return (
    <Disclosure>
      <Disclosure.Button
        className={`w-fit text-left ${
          highlightId === 'id' + item.id ? 'bg-gray-200' : ''
        }`}
        onClick={() => {
          if (viewAll) {
            reduceQuestions()
          }
        }}
      >
        <ReactMarkdown>{item.title}</ReactMarkdown>
      </Disclosure.Button>
      <Disclosure.Panel className="w-fit py-4 text-cyan-700">
        <p>{item.text}</p>
      </Disclosure.Panel>
    </Disclosure>
  )
}
