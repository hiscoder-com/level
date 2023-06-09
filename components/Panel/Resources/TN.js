import { useEffect, useState } from 'react'

import { useRecoilValue } from 'recoil'

import { currentVerse } from '../state/atoms'

import ReactMarkdown from 'react-markdown'

import { Placeholder, TNTWLContent } from '../UI'

import { useGetResource, useScroll } from 'utils/hooks'

function TN({ config, url, toolName }) {
  const [item, setItem] = useState(null)
  const { isLoading, data, error } = useGetResource({ config, url })

  return (
    <>
      {isLoading ? (
        <Placeholder />
      ) : (
        <div className="relative h-full">
          <TNTWLContent setItem={setItem} item={item} />
          <TNList
            setItem={setItem}
            data={data}
            toolName={toolName}
            isLoading={isLoading}
          />
        </div>
      )}
    </>
  )
}

export default TN

function TNList({ setItem, data, toolName, isLoading }) {
  const [verses, setVerses] = useState([])
  const verse = useRecoilValue(currentVerse)

  const { highlightId, handleSave, currentScrollVerse } = useScroll({ toolName })

  useEffect(() => {
    const id = 'idtn' + currentScrollVerse
    setTimeout(() => {
      document?.getElementById(id)?.scrollIntoView()
    }, 100)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, verse])

  useEffect(() => {
    data && setVerses(Object.entries(data))
  }, [data])

  return (
    <div className="divide-y divide-gray-800 divide-dashed h-full overflow-auto">
      {data &&
        verses.map(([verseNumber, notes], index) => {
          return (
            <div key={index} className="p-4 flex mx-4">
              <div className="text-2xl">{verseNumber}</div>
              <div className="text-gray-700 pl-7 flex-1" id={'idtn' + verseNumber}>
                <ul>
                  {notes?.map((note) => {
                    return (
                      <li
                        key={note.id}
                        id={'idtn' + note.id}
                        className={`p-2 cursor-pointer hover:bg-gray-200 ${
                          highlightId === 'id' + note.id ? 'bg-gray-200' : ''
                        }`}
                        onClick={() => {
                          handleSave(verseNumber, note.id)
                          setItem({ text: note.text, title: note.title })
                        }}
                      >
                        <ReactMarkdown>{note.title}</ReactMarkdown>
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
