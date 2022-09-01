import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import useSWR from 'swr'
import { Disclosure } from '@headlessui/react'

function TQ({ config }) {
  const {
    reference: { book, chapter, step, verses },
    resource: { owner, repo, commit, bookPath, language },
  } = config
  const params = { owner, repo, commit, bookPath, language, book, chapter, step, verses }
  const fetcher = (url, params) => axios.get(url, { params }).then((res) => res.data)
  const { data, error } = useSWR([`/api/git/tq`, params], fetcher)
  const loading = !data && !error
  return <>{loading ? 'loading...' : <TQView question={data} />}</>
}

export default TQ

function TQView({ question }) {
  return (
    <div className="grid grid-cols-1 gap-3 w-fit pt-4">
      {question.map((el, index) => {
        return (
          <Disclosure key={index}>
            <Disclosure.Button className="py-2 btn-cyan w-fit">
              {el.Reference}
              <ReactMarkdown>{el.Question}</ReactMarkdown>
            </Disclosure.Button>
            <Disclosure.Panel className="text-gray-800 w-fit">
              <ReactMarkdown>{el.Response}</ReactMarkdown>
            </Disclosure.Panel>
          </Disclosure>
        )
      })}
    </div>
  )
}
