import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import useSWR from 'swr'
import { Disclosure } from '@headlessui/react'

function OBSTWL({ config }) {
  const {
    reference: { chapter, step, verses },
    resource: { owner, repo, commit, bookPath, language },
  } = config
  const params = { owner, repo, commit, bookPath, language, chapter, step, verses }
  const fetcher = (url, params) => axios.get(url, { params }).then((res) => res.data)
  const { data, error } = useSWR([`/api/git/obs-twl`, params], fetcher)
  const loading = !data && !error
  return <>{loading ? 'loading...' : <TWLView words={data} />}</>
}

export default OBSTWL

function TWLView({ words }) {
  return (
    <div className="grid grid-cols-1 gap-3  w-fit pt-4 ">
      {words.map((el, index) => {
        return (
          <Disclosure key={index}>
            <Disclosure.Button className="py-2 btn-cyan w-fit">
              {el.reference}
              <ReactMarkdown>{el.title}</ReactMarkdown>
            </Disclosure.Button>
            <Disclosure.Panel className="text-gray-800 w-fit">
              <ReactMarkdown>{el.text}</ReactMarkdown>
            </Disclosure.Panel>
          </Disclosure>
        )
      })}
    </div>
  )
}
