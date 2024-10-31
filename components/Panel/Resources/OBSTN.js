import { useEffect, useState } from 'react'

import ReactMarkdown from 'react-markdown'

import { Placeholder, TNTWLContent } from '../UI'

import { useGetResource, useScroll } from 'utils/hooks'

function OBSTN({ config, url, toolName }) {
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

export default OBSTN

function TNList({ setItem, data, toolName, isLoading }) {
  const [verses, setVerses] = useState([])
  const { highlightId, handleSaveScroll } = useScroll({
    toolName,
    isLoading,
    idPrefix: 'idtn',
  })

  useEffect(() => {
    if (data) {
      setVerses(Object.entries(data))
    }
  }, [data])

  return (
    <div
      id={`container_${toolName}`}
      className="h-full divide-y divide-dashed divide-th-text-primary overflow-auto"
    >
      {data &&
        verses.map(([verseNumber, notes], index) => {
          return (
            <div key={index} className="mx-4 flex p-4">
              <div className="text-2xl">{verseNumber}</div>
              <div className="flex-1 pl-7 text-th-text-primary" id={'idtn' + verseNumber}>
                <ul>
                  {notes?.map((note) => {
                    return (
                      <li
                        key={note.id}
                        id={'idtn' + note.id}
                        className={`cursor-pointer p-2 hover:bg-th-secondary-100 ${
                          highlightId === 'id' + note.id
                            ? 'rounded-lg bg-th-secondary-100'
                            : ''
                        }`}
                        onClick={() => {
                          handleSaveScroll(verseNumber, note.id)
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
