import { useMemo } from 'react'

import ReactMarkdown from 'react-markdown'

import { useRecoilValue } from 'recoil'

import { Placeholder } from '../UI'

import { checkedVersesBibleState, currentVerse } from '../state/atoms'
import { useGetResource, useScroll } from 'utils/hooks'
import { obsCheckAdditionalVerses } from 'utils/helper'

function Bible({ config, url, toolName }) {
  const { isLoading, data } = useGetResource({
    config,
    url,
  })
  const { handleSave, currentScrollVerse } = useScroll({
    toolName,
    idPrefix: 'id',
    isLoading,
  })

  return (
    <>
      {isLoading ? (
        <Placeholder />
      ) : config?.config?.draft ? (
        <VersesExtended verseObjects={data?.verseObjects} handleSave={handleSave} />
      ) : (
        <Verses
          verseObjects={data?.verseObjects}
          handleSave={handleSave}
          currentScrollVerse={currentScrollVerse}
        />
      )}
    </>
  )
}

export default Bible

function Verses({ verseObjects, handleSave, currentScrollVerse }) {
  return (
    <>
      {verseObjects?.map((verseObject) => (
        <div
          key={verseObject.verse}
          id={'id' + verseObject.verse}
          className={`p-2 ${
            'id' + currentScrollVerse === 'id' + verseObject.verse ? 'bg-gray-200' : ''
          }`}
          onClick={() => {
            handleSave(String(verseObject.verse))
          }}
        >
          <ReactMarkdown>
            {obsCheckAdditionalVerses(verseObject.verse) + ' ' + verseObject.text}
          </ReactMarkdown>
        </div>
      ))}
    </>
  )
}

function VersesExtended({ verseObjects, handleSave, currentScrollVerse }) {
  const checkedVersesBible = useRecoilValue(checkedVersesBibleState)
  return (
    <>
      {verseObjects?.map((verseObject) => {
        const checkedCurrent = checkedVersesBible.includes(verseObject.verse)
        return (
          <div
            key={verseObject.verse}
            onClick={() => handleSave(verseObject.verse)}
            className={`my-3 flex items-start select-none ${
              'id' + currentScrollVerse === 'id' + verseObject.verse ? 'bg-gray-200' : ''
            }`}
          >
            <div id={'id' + verseObject.verse} className={`ml-2`}>
              {obsCheckAdditionalVerses(verseObject.verse)}
            </div>
            {checkedCurrent ? (
              <Blur verse={verseObject.text} />
            ) : (
              <ReactMarkdown className={`ml-2`}>{verseObject.text}</ReactMarkdown>
            )}
          </div>
        )
      })}
    </>
  )
}

function Blur({ verse }) {
  const text = useMemo(
    () =>
      verse
        .split(' ')
        .map((el) => shuffle(el))
        .join(' '),
    [verse]
  )
  return (
    <ReactMarkdown className={`ml-2 bg-blue-350 text-blue-350 select-none`}>
      {text}
    </ReactMarkdown>
  )
}

const shuffle = (text) => {
  const arr = text.split('')
  let j
  for (let i = arr.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1))
    ;[arr[j], arr[i]] = [arr[i], arr[j]]
  }
  return arr.join('')
}
