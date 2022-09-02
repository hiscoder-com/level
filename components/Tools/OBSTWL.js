import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import useSWR from 'swr'
import { useState } from 'react'
import Close from '../../public/close.svg'

function OBSTWL({ config }) {
  const [word, setWord] = useState(null)

  const {
    reference: { chapter, step, verses },
    resource: { owner, repo, commit, bookPath, language },
  } = config
  const params = { owner, repo, commit, bookPath, language, chapter, step, verses }
  const fetcher = (url, params) => axios.get(url, { params }).then((res) => res.data)
  const { data, error } = useSWR([`/api/git/obs-twl`, params], fetcher)
  const loading = !data && !error
  return (
    <>
      {word ? (
        <TWLCover setWord={setWord} word={word} />
      ) : (
        <TWLContent setWord={setWord} data={data} />
      )}
    </>
  )
}

export default OBSTWL

function TWLCover({ setWord, word }) {
  return (
    <div className="relative border-2 border-gray-500 p-8 mx-4">
      <div
        className="absolute top-0 right-0 w-8 pt-3 pr-3 cursor-pointer"
        onClick={() => setWord(null)}
      >
        <Close />
      </div>
      <div className=" font-bold text-xl mb-2">
        <ReactMarkdown>{word.title}</ReactMarkdown>
      </div>
      <ReactMarkdown>{word.text}</ReactMarkdown>
    </div>
  )
}

function TWLContent({ setWord, data }) {
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
                  {el[1]?.map((word, index) => {
                    return (
                      <li
                        key={index}
                        className="py-2"
                        onClick={() => setWord({ text: word.text, title: word.title })}
                      >
                        <ReactMarkdown>{word.title}</ReactMarkdown>
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
