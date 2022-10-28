import { useMemo } from 'react'

import ReactMarkdown from 'react-markdown'

import { Placeholder } from '../UI'

import { checkedVersesBibleState } from '../state/atoms'
import { useRecoilValue } from 'recoil'
import { useGetResource } from 'utils/hooks'

// draft: true/false
function Bible({ config, url }) {
  const { loading, data, error } = useGetResource({
    config,
    url,
  })

  return (
    <>
      {loading ? (
        <Placeholder />
      ) : config?.config?.draft ? (
        <VersesExtended verseObjects={data?.verseObjects} />
      ) : (
        <Verses verseObjects={data?.verseObjects} />
      )}
    </>
  )
}

export default Bible

function Verses({ verseObjects }) {
  return (
    <>
      {verseObjects?.map((el) => (
        <ul key={el.verse} className="flex">
          <li className={`py-2`}>
            <ReactMarkdown>{el.verse + ' ' + el.text}</ReactMarkdown>
          </li>
        </ul>
      ))}
    </>
  )
}

function VersesExtended({ verseObjects }) {
  const checkedVersesBible = useRecoilValue(checkedVersesBibleState)

  return (
    <>
      {verseObjects?.map((el, index) => {
        const checkedCurrent = checkedVersesBible.includes(el.verse)
        return (
          <div key={el.verse} className={`my-3 flex items-start`}>
            <div className={`ml-2`}>{el.verse}</div>
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
  return <ReactMarkdown className={`ml-2 blur-sm select-none`}>{text}</ReactMarkdown>
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
