import { useMemo } from 'react'

import ReactMarkdown from 'react-markdown'

import { Placeholder } from '../UI'

import { checkedVersesBibleState } from '../state/atoms'
import { useRecoilValue } from 'recoil'
import { useGetResource, useScroll } from 'utils/hooks'

// draft: true/false
function Bible({ config, url, toolName }) {
  const { loading, data, error } = useGetResource({
    config,
    url,
  })
  const { scrollId, handleSave } = useScroll({ toolName })
  return (
    <>
      {loading ? (
        <Placeholder />
      ) : config?.config?.draft ? (
        <VersesExtended
          verseObjects={data?.verseObjects}
          handleSave={handleSave}
          scrollId={scrollId}
        />
      ) : (
        <Verses
          verseObjects={data?.verseObjects}
          handleSave={handleSave}
          scrollId={scrollId}
        />
      )}
    </>
  )
}

export default Bible

function Verses({ verseObjects, handleSave, scrollId }) {
  return (
    <>
      {verseObjects?.map((el) => (
        <ul key={el.verse} className="flex">
          <li
            id={'id' + el.verse}
            className={`p-2 ${scrollId === 'id' + el.verse ? 'bg-gray-200' : ''}`}
            onClick={() => handleSave(el.verse)}
          >
            <ReactMarkdown>{el.verse + ' ' + el.text}</ReactMarkdown>
          </li>
        </ul>
      ))}
    </>
  )
}

function VersesExtended({ verseObjects, handleSave, scrollId }) {
  const checkedVersesBible = useRecoilValue(checkedVersesBibleState)

  return (
    <>
      {verseObjects?.map((el, index) => {
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
              {el.verse}
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
