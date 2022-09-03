import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import useSWR from 'swr'
import { Disclosure } from '@headlessui/react'
import Close from '../../public/close.svg'

function TQ({ config }) {
  const {
    reference: { book, chapter, step, verses },
    resource: { owner, repo, commit, bookPath, language },
  } = config
  const params = { owner, repo, commit, bookPath, language, book, chapter, step, verses }
  const fetcher = (url, params) => axios.get(url, { params }).then((res) => res.data)
  const { data, error } = useSWR([`/api/git/tq`, params], fetcher)
  const loading = !data && !error
  return (
    <>
      <TWLContent data={data} />
    </>
  )
}

export default TQ

function TWLContent({ data }) {
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
                  {el[1]?.map((question, index) => {
                    return (
                      <li key={index} className="py-2">
                        <TQView question={question} />
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

function TQView({ question }) {
  return (
    <Disclosure>
      <Disclosure.Button className="py-2 font-bold text-xl bg-gray-300 rounded-md px-2  w-fit">
        <ReactMarkdown>{question.Question}</ReactMarkdown>
      </Disclosure.Button>
      <Disclosure.Panel className="text-gray-800 w-fit py-4">
        <ReactMarkdown>{question.Response}</ReactMarkdown>
      </Disclosure.Panel>
    </Disclosure>
  )
}
