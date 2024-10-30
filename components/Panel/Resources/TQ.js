import { Disclosure } from '@headlessui/react'
import Down from 'public/arrow-down.svg'
import ReactMarkdown from 'react-markdown'
import { useGetResource, useScroll } from 'utils/hooks'

import { Placeholder } from '../UI'

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
    <div className="divide-y divide-dashed divide-th-text-primary">
      {data &&
        Object.keys(data)?.map((key) => {
          return (
            <div key={key} className="mx-4 flex p-4" id={`idtq_${key}`}>
              <div className="text-2xl">{key}</div>
              <div className="w-full pl-7 text-th-text-primary">
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
      {({ open }) => (
        <>
          <Disclosure.Button
            className={`flex w-full items-center justify-between gap-2 p-2 text-left ${
              highlightId === 'id' + item.id ? 'rounded-lg bg-th-secondary-100' : ''
            }`}
            onClick={() => {
              if (viewAll) {
                reduceQuestions()
              }
            }}
          >
            <ReactMarkdown>{item.title}</ReactMarkdown>
            <Down
              className={`h-5 w-5 min-w-[1.25rem] stroke-th-text-primary ${
                open ? 'rotate-180' : ''
              }`}
            />
          </Disclosure.Button>
          <Disclosure.Panel className="w-fit py-4 text-th-text-primary">
            <p className="ml-2">{item.text}</p>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}
