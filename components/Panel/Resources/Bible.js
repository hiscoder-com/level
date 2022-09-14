import { useRouter } from 'next/router'
import ReactMarkdown from 'react-markdown'
import { useRecoilState, useRecoilValue } from 'recoil'

import { useGetResource } from 'utils/hooks'
import { checkedVersesBibleState, translatedVersesState } from '../state/atoms'
import { Placeholder } from '../UI'

function Bible({ config, url }) {
  const { query } = useRouter()
  const { step } = query
  const { loading, data, error } = useGetResource({ config, url })
  console.log(data)
  return (
    <>
      {loading ? (
        <Placeholder />
      ) : step === '4' ? (
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
              type="checkBox"
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
            <ReactMarkdown className={`ml-4 t-0 ${checkedCurrent ? 'blur-sm' : ''}`}>
              {`${el.verse} ${checkedCurrent ? shuffle(el.text) : el.text}`}
            </ReactMarkdown>
          </div>
        )
      })}
    </>
  )
}

const shuffle = (text) => {
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
