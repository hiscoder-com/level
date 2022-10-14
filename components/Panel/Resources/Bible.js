import { useMemo } from 'react'

import ReactMarkdown from 'react-markdown'

import { useRecoilState, useRecoilValue } from 'recoil'

import { useGetResource } from 'utils/hooks'
import { checkedVersesBibleState, translatedVersesState } from '../state/atoms'
import { Placeholder } from '../UI'

function Bible({ config, url }) {
  console.log({ verses: config.reference.verses })
  const { loading, data, error } = useGetResource({
    config,
    url,
  })
  return (
    <>
      {loading ? (
        <Placeholder />
      ) : config?.resource?.draft ? (
        <VersesExtended data={data} />
      ) : (
        <Verses data={data} />
      )}
    </>
  )
}

export default Bible

function Verses({ data }) {
  return (
    <>
      {data?.verseObjects?.map((el) => (
        <ul key={el.verse} className="flex">
          <li className={`py-2`}>
            <ReactMarkdown>{el.verse + ' ' + el.text}</ReactMarkdown>
          </li>
        </ul>
      ))}
    </>
  )
}

function VersesExtended({ data }) {
  const [checkedVersesBible, setCheckedVersesBible] = useRecoilState(
    checkedVersesBibleState
  )
  const translatedVerses = useRecoilValue(translatedVersesState)
  const translatedVersesKeys = translatedVerses.map((el) => el.key)

  return (
    <>
      {data?.verseObjects?.map((el, index) => {
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
                  (!translatedVersesKeys.includes(data?.verseObjects[index - 1].verse) ||
                    checkedCurrent))
              }
              onChange={() => {
                setCheckedVersesBible((prev) => [...prev, el.verse])
              }}
            />
            <div className={`ml-2`}>{el.verse}</div>
            {checkedCurrent ? (
              <Blur data={el.text} />
            ) : (
              <ReactMarkdown className={`ml-2`}>{el.text}</ReactMarkdown>
            )}
          </div>
        )
      })}
    </>
  )
}

function Blur({ data }) {
  const text = useMemo(
    () =>
      data
        .split(' ')
        .map((el) => shuffle(el))
        .join(' '),
    [data]
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
