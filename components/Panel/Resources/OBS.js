import { useRouter } from 'next/router'

import ReactMarkdown from 'react-markdown'

import { useRecoilState, useRecoilValue } from 'recoil'

import { useGetResource } from 'utils/hooks'
import Placeholder from '../UI/Placeholder'

import { checkedVersesBibleState, translatedVersesState } from '../state/atoms'
import { shuffle } from 'utils/helpers'

function OBS({ config }) {
  const { query } = useRouter()
  const { step } = query
  const { loading, data, error } = useGetResource({ config, url: `/api/git/obs` })
  return (
    <>
      {/* <div className="text-3xl">{data?.header}</div> */}
      {loading ? (
        <Placeholder />
      ) : step === '4' ? (
        <ObsViewExtended data={data} />
      ) : (
        <ObsView data={data} />
      )}
    </>
  )
}

export default OBS

function ObsView({ data }) {
  return (
    <>
      <div>
        {data?.verseObjects?.map((el) => (
          <div key={el.verse} className="py-2 flex">
            <span className="mr-2">{el.verse}</span>

            <ReactMarkdown>{el.text}</ReactMarkdown>
          </div>
        ))}
      </div>
    </>
  )
}

function ObsViewExtended({ data }) {
  const [checkedVersesBible, setCheckedVersesBible] = useRecoilState(
    checkedVersesBibleState
  )
  const translatedVerses = useRecoilValue(translatedVersesState)
  const translatedVersesKeys = translatedVerses.map((el) => el.key)
  console.log(translatedVerses)

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
                  (!translatedVersesKeys.includes(data?.verseObjects[index - 1]?.verse) ||
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
