import { useMemo } from 'react'

import ReactMarkdown from 'react-markdown'

import { useTranslation } from 'next-i18next'

import { useRecoilValue } from 'recoil'

import { Placeholder } from '../UI'

import { checkedVersesBibleState } from '../state/atoms'
import { useGetResource, useScroll } from 'utils/hooks'
import { obsCheckAdditionalVerses } from 'utils/helper'

function Bible({ config, url, toolName }) {
  const { t } = useTranslation('common')

  const { isLoading, data } = useGetResource({
    config,
    url,
  })
  const { scrollId, handleSave } = useScroll({ toolName })
  return (
    <>
      {isLoading ? (
        <Placeholder />
      ) : config?.config?.draft ? (
        <VersesExtended
          verseObjects={data?.verseObjects}
          handleSave={handleSave}
          scrollId={scrollId}
          t={t}
        />
      ) : (
        <Verses
          verseObjects={data?.verseObjects}
          handleSave={handleSave}
          scrollId={scrollId}
          t={t}
        />
      )}
    </>
  )
}

export default Bible

function Verses({ verseObjects, handleSave, scrollId, t }) {
  return (
    <>
      {verseObjects?.map((verseObject) => (
        <div
          key={verseObject.verse}
          id={'id' + verseObject.verse}
          className={`p-2 ${scrollId === 'id' + verseObject.verse ? 'bg-gray-200' : ''}`}
          onClick={() => handleSave(verseObject.verse)}
        >
          <ReactMarkdown>
            {obsCheckAdditionalVerses(verseObject.verse) + ' ' + verseObject.text}
          </ReactMarkdown>
        </div>
      ))}
    </>
  )
}

function VersesExtended({ verseObjects, handleSave, scrollId, t }) {
  const checkedVersesBible = useRecoilValue(checkedVersesBibleState)
  return (
    <>
      {verseObjects?.map((verseObject) => {
        const checkedCurrent = checkedVersesBible.includes(verseObject.verse)
        return (
          <div
            key={verseObject.verse}
            onClick={() => handleSave(verseObject.verse)}
            className={`my-3 flex items-start ${
              scrollId === 'id' + verseObject.verse ? 'bg-gray-200' : ''
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
