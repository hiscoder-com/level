import { useRouter } from 'next/router'

import ReactMarkdown from 'react-markdown'

import { useRecoilState, useRecoilValue } from 'recoil'

import { useGetResource } from 'utils/hooks'
import Placeholder from '../UI/Placeholder'

import { checkedVersesBibleState, translatedVersesState } from '../state/atoms'

function shuffle(text) {
  let j, temp
  const arr = text.split('')
  for (let i = arr.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1))
    temp = arr[j]
    arr[j] = arr[i]
    arr[i] = temp
  }
  return arr.join('')
}

function Bible({ config }) {
  const { query } = useRouter()
  const { step } = query
  const { loading, data, error } = useGetResource({ config, url: '/api/git/bible' })

  return (
    <div>
      {loading ? (
        <Placeholder />
      ) : step === '4' ? (
        <BibleViewExtended data={data} />
      ) : (
        <BibleView data={data} checkView={false} />
      )}
    </div>
  )
}

export default Bible

function BibleView({ data }) {
  return (
    <>
      {data?.map((el) => (
        <ul key={el.verse} className="flex">
          <li className={`py-2`}>
            <ReactMarkdown>{el.verse + ' ' + el.text}</ReactMarkdown>
          </li>
        </ul>
      ))}
    </>
  )
}

function BibleViewExtended({ data }) {
  const [checkedVersesBible, setCheckedVersesBible] = useRecoilState(
    checkedVersesBibleState
  )
  const translatedVerses = useRecoilValue(translatedVersesState)
  const translatedVersesKeys = translatedVerses.map((el) => el.key)

  return (
    <>
      {data?.map((el, index) => {
        const checkedCurrent = checkedVersesBible.includes(el.verse)
        return (
          <div key={el.verse} className={`my-3 flex items-start`}>
            <input
              checked={checkedCurrent}
              type="checkBox"
              className="mt-1"
              disabled={
                checkedCurrent ||
                (index !== 0 &&
                  (!translatedVersesKeys.includes(data[index - 1].verse) ||
                    checkedCurrent))
              }
              onChange={() => {
                setCheckedVersesBible((prev) => [...prev, el.verse])
              }}
            />
            <ReactMarkdown className={`ml-4 t-0 ${checkedCurrent ? 'blur-sm' : ''}`}>
              {`${el.verse} ${checkedCurrent ? shuffle(el.text) : el.text}`}
            </ReactMarkdown>
          </div>
        )
      })}
    </>
  )
}
