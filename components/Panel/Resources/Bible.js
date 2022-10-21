import { useMemo } from 'react'

import ReactMarkdown from 'react-markdown'

import { useRecoilState, useRecoilValue } from 'recoil'

import { Placeholder } from '../UI'

import { useGetResource } from 'utils/hooks'

import { checkedVersesBibleState, translatedVersesState } from '../state/atoms'

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
  const [checkedVersesBible, setCheckedVersesBible] = useRecoilState(
    checkedVersesBibleState
  )
  const translatedVerses = useRecoilValue(translatedVersesState)

  return (
    <>
      {verseObjects?.map((el, index) => {
        const checkedCurrent = checkedVersesBible.includes(el.verse)
        return (
          <div key={el.verse} className={`my-3 flex items-start`}>
            <input
              checked={checkedCurrent}
              type="checkbox"
              className="mt-1"
              disabled={
                checkedCurrent ||
                (index !== 0 &&
                  (!translatedVerses.includes(verseObjects?.[index - 1]?.verse) ||
                    checkedCurrent))
              }
              onChange={() => {
                setCheckedVersesBible((prev) => [...prev, el.verse])
              }}
            />
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
  return <ReactMarkdown className={`ml-2 blur-sm`}>{text}</ReactMarkdown>
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
