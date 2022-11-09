import ReactMarkdown from 'react-markdown'

import { Disclosure } from '@headlessui/react'

import { Placeholder } from '../UI'

import { useGetResource } from 'utils/hooks'
import { useState } from 'react'
import { checkLSVal } from 'utils/helper'

function TQ({ config, url, toolName }) {
  const { loading, data, error } = useGetResource({ config, url })
  return (
    <>
      {loading ? (
        <Placeholder />
      ) : (
        <ToolList
          data={data}
          viewAll={config?.resource?.viewAllQuestions}
          toolName={toolName}
        />
      )}
    </>
  )
}

export default TQ

function ToolList({ data, viewAll, toolName }) {
  let uniqueVerses = new Set()
  const reduceQuestions = (title) => {
    uniqueVerses.add(title)
    if (Object.values(data).flat().length === uniqueVerses.size) {
      console.log('все вопросы просмотрены!') //TODO это для проверки просмотра всех вопросов
    }
  }

  const [currentQuestionId, setCurrentQuestionId] = useState(() => {
    return checkLSVal(toolName, '', 'string')
  })

  const handleSave = (id) => {
    localStorage.setItem(toolName, 'id' + id)
    setCurrentQuestionId('id' + id)
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
                      <li
                        key={item.id}
                        id={'id' + item.id}
                        onClick={() => handleSave(item.id)}
                        className="py-2"
                      >
                        <ToolContent
                          item={item}
                          reduceQuestions={() => reduceQuestions(item.title)}
                          viewAll={viewAll}
                          toolName={toolName}
                          currentQuestionId={currentQuestionId}
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

function ToolContent({ item, reduceQuestions, viewAll, currentQuestionId }) {
  return (
    <Disclosure>
      <Disclosure.Button
        className={`text-left w-fit ${
          currentQuestionId === 'id' + item.id ? 'underline' : ''
        }`}
        onClick={() => {
          if (viewAll) {
            reduceQuestions()
          }
        }}
      >
        <ReactMarkdown>{item.title}</ReactMarkdown>
      </Disclosure.Button>
      <Disclosure.Panel className="text-cyan-700 w-fit py-4">
        <p>{item.text}</p>
      </Disclosure.Panel>
    </Disclosure>
  )
}
