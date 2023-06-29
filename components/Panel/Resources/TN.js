import { useEffect, useState } from 'react'

import ReactMarkdown from 'react-markdown'

import { Placeholder, TNTWLContent } from '../UI'

import { useGetResource, useScroll } from 'utils/hooks'

import { useQuotesTranslation } from '@texttree/tn-quote'

import { filterNotes } from 'utils/helper'

function TN({ config, url, toolName }) {
  const [item, setItem] = useState(null)
  const [tnotes, setTnotes] = useState([])
  const { isLoading, data, error } = useGetResource({ config, url })

  const { extraTNotes, setTnotes: updateTnotes } = useQuotesTranslation({
    domain: process.env.NEXT_PUBLIC_NODE_HOST ?? 'https://git.door43.org',
    book: config.reference.book,
    tnotes: data,
    usfm: {
      link:
        (process.env.NEXT_PUBLIC_NODE_HOST ?? 'https://git.door43.org') +
        '/' +
        config.targetResourceLink,
    },
  })

  useEffect(() => {
    if (extraTNotes) {
      const _data = []
      for (const el of extraTNotes) {
        filterNotes(el, el.verse, _data)
      }
      setTnotes(_data)
    }
  }, [extraTNotes])

  useEffect(() => {
    if (updateTnotes && data) {
      updateTnotes(data)
    }
  }, [data, updateTnotes])

  return (
    <>
      {isLoading ? (
        <Placeholder />
      ) : (
        <div className="relative h-full">
          <TNTWLContent setItem={setItem} item={item} />
          <TNList
            setItem={setItem}
            data={tnotes}
            toolName={toolName}
            isLoading={isLoading || tnotes}
          />
        </div>
      )}
    </>
  )
}

export default TN

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
                        key={note.ID}
                        id={'idtn' + note.ID}
                        className={`p-2 cursor-pointer hover:bg-gray-200 ${
                          highlightId === 'id' + note.ID ? 'bg-gray-200' : ''
                        }`}
                        onClick={() => {
                          handleSaveScroll(verseNumber, note.ID)
                          setItem({ text: note.Note, title: note.Quote })
                        }}
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
    </div>
  )
}
