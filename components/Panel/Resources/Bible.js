import { useMemo } from 'react'

import ReactMarkdown from 'react-markdown'

import { useRecoilValue } from 'recoil'

import { Placeholder } from '../UI'
import MarkdownExtended from 'components/MarkdownExtended'

import { checkedVersesBibleState } from '../../state/atoms'
import { useGetResource, useScroll } from 'utils/hooks'
import { obsCheckAdditionalVerses } from 'utils/helper'

function Bible({ config, url, toolName }) {
  const { isLoading, data } = useGetResource({
    config,
    url,
  })
  const { handleSaveScroll, currentScrollVerse } = useScroll({
    toolName,
    idPrefix: 'id',
    isLoading,
  })

  return (
    <>
      {isLoading ? (
        <Placeholder />
      ) : config?.config?.draft ? (
        <VersesExtended
          verseObjects={data?.verseObjects}
          handleSaveScroll={handleSaveScroll}
        />
      ) : (
        <Verses
          verseObjects={data?.verseObjects}
          handleSaveScroll={handleSaveScroll}
          currentScrollVerse={currentScrollVerse}
        />
      )}
    </>
  )
}

export default Bible

function Verses({ verseObjects, handleSaveScroll, currentScrollVerse }) {
  return (
    <>
      {verseObjects?.map((verseObject) => (
        <div
          key={verseObject.verse}
          id={'id' + verseObject.verse}
          className={`p-2 rounded-lg ${
            'id' + currentScrollVerse === 'id' + verseObject.verse
              ? 'bg-th-secondary-100'
              : ''
          }`}
          onClick={() => handleSaveScroll(String(verseObject.verse))}
        >
          <MarkdownExtended>
            {obsCheckAdditionalVerses(verseObject.verse) + ' ' + verseObject.text}
          </MarkdownExtended>
        </div>
      ))}
    </>
  )
}

function VersesExtended({ verseObjects, handleSaveScroll, currentScrollVerse }) {
  const checkedVersesBible = useRecoilValue(checkedVersesBibleState)
  return (
    <>
      {verseObjects?.map((verseObject) => {
        const checkedCurrent = checkedVersesBible.includes(verseObject.verse)
        return (
          <div
            key={verseObject.verse}
            onClick={() => handleSaveScroll(verseObject.verse)}
            className={`flex items-start my-3 select-none rounded-lg ${
              'id' + currentScrollVerse === 'id' + verseObject.verse
                ? 'bg-th-secondary-100'
                : ''
            }`}
          >
            <div id={'id' + verseObject.verse} className={`ml-2`}>
              {obsCheckAdditionalVerses(verseObject.verse)}
            </div>
            {checkedCurrent ? (
              <Blur verse={verseObject.text} />
            ) : (
              <ReactMarkdown className="ml-2">{verseObject.text}</ReactMarkdown>
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
    <ReactMarkdown className="ml-2 bg-th-secondary-100 text-th-secondary-100 rounded-lg select-none">
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
