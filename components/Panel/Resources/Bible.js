import { useMemo } from 'react'

import ReactMarkdown from 'react-markdown'

import { useTranslation } from 'next-i18next'

import { useRecoilValue } from 'recoil'

import { Placeholder } from '../UI'

import { checkedVersesBibleState } from '../state/atoms'
import { useGetResource, useScroll } from 'utils/hooks'

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
      {verseObjects?.map((el) => (
        <div
          key={el.verse}
          id={'id' + el.verse}
          className={`p-2 ${scrollId === 'id' + el.verse ? 'bg-gray-200' : ''}`}
          onClick={() => handleSave(el.verse)}
        >
          <ReactMarkdown>
            {(el.verse === '0'
              ? t('Title')
              : el.verse === '200'
              ? t('Reference')
              : el.verse) +
              ' ' +
              el.text}
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
      {verseObjects?.map((el) => {
        const checkedCurrent = checkedVersesBible.includes(el.verse)
        return (
          <div
            key={el.verse}
            onClick={() => {
              handleSave(el.verse)
            }}
            className={`my-3 flex items-start ${
              scrollId === 'id' + el.verse ? 'bg-gray-200' : ''
            }`}
          >
            <div id={'id' + el.verse} className={`ml-2`}>
              {el.verse === '0'
                ? t('Title')
                : el.verse === '200'
                ? t('Reference')
                : el.verse}
            </div>
            {checkedCurrent ? (
              <Blur verse={el.text} />
            ) : (
              <ReactMarkdown className={`ml-2`}>{el.text}</ReactMarkdown>
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
