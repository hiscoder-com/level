import ReactMarkdown from 'react-markdown'
import { useGetResource } from 'utils/hooks'
import Placeholder from '../UI/Placeholder'
import { useRouter } from 'next/router'
import { useRecoilState, useRecoilValue } from 'recoil'

import { checkBible, checkTranslate } from '../state/atoms'

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
function shuffle(s) {
  var j, temp
  const arr = s.split('')
  for (var i = arr.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1))
    temp = arr[j]
    arr[j] = arr[i]
    arr[i] = temp
  }
  return arr.join('')
}

function BibleViewExtended({ data }) {
  const [_checkBible, setCheckBible] = useRecoilState(checkBible)
  const _checkTranslate = useRecoilValue(checkTranslate)
  return (
    <>
      {data?.map((el, index) => (
        <div key={el.verse} className={`my-3 flex items-start`}>
          <input
            checked={_checkBible.includes(el.verse)}
            type="checkBox"
            className="mt-1"
            disabled={
              index === 0
                ? data[0]?.verse !== el.verse || _checkBible.includes(el.verse)
                : !_checkTranslate
                    .map((el) => parseInt(el))
                    .includes(parseInt(el.verse) - 1) || _checkBible.includes(el.verse)
            }
            onChange={() => {
              setCheckBible((prev) => [...prev, el.verse])
            }}
          />
          <ReactMarkdown
            className={`ml-4 t-0 ${_checkBible.includes(el.verse) ? 'blur-sm' : ''}`}
          >
            {`${el.verse} ${_checkBible.includes(el.verse) ? shuffle(el.text) : el.text}`}
          </ReactMarkdown>
        </div>
      ))}
    </>
  )
}
