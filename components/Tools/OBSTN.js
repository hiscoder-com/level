import axios from 'axios'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import useSWR from 'swr'
import Close from '../../public/close.svg'

function OBSTN({ config }) {
  const [note, setNote] = useState(null)

  const {
    reference: { chapter, step, verses },
    resource: { owner, repo, commit, bookPath, language },
  } = config
  const params = { owner, repo, commit, bookPath, language, chapter, step, verses }
  const fetcher = (url, params) => axios.get(url, { params }).then((res) => res.data)
  const { data, error } = useSWR([`/api/git/obs-tn`, params], fetcher)
  const loading = !data && !error
  return (
    <>
      {note ? (
        <TNCover setNote={setNote} note={note} />
      ) : (
        <TNContent setNote={setNote} data={data} />
      )}
    </>
  )
}

export default OBSTN

function TNCover({ setNote, note }) {
  return (
    <div className="relative border-2 border-gray-500 p-8 mx-4">
      <div
        className="absolute top-0 right-0 w-8 pt-3 pr-3 cursor-pointer"
        onClick={() => setNote(null)}
      >
        <Close />
      </div>
      <div className=" font-bold text-xl mb-2">{note.title}</div>
      <div>{note.text}</div>
    </div>
  )
}

function TNContent({ setNote, data }) {
  return (
    <>
      {data &&
        Object.entries(data).map((el) => {
          return (
            <div
              key={el.ID}
              className="border-2 w-min-20 p-4 border-gray-500 mb-4 flex items-center mx-4"
            >
              <div className="text-5xl">{el[0]}</div>
              <div className="text-gray-700 pl-7">
                <ul>
                  {el[1]?.map((note) => {
                    return (
                      <li
                        key={note.ID}
                        className="py-2"
                        onClick={() => setNote({ text: note.Note, title: note.Quote })}
                      >
                        <ReactMarkdown>{note.Quote}</ReactMarkdown>
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
