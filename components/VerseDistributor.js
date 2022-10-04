import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import { useCurrentUser } from 'lib/UserContext'
import { useProject, useTranslators } from 'utils/hooks'
import { supabase } from 'utils/supabaseClient'
const defaultColor = [
  'bg-yellow-400',
  'bg-green-400',
  'bg-blue-400',
  'bg-pink-400',
  'bg-violet-400',
  'bg-orange-400',
  'bg-cyan-400',
  'bg-red-400',
  'bg-fuchsia-400',
  'bg-teal-400',
]

function VerseDistributor({ verses }) {
  const { user } = useCurrentUser()
  const {
    query: { code },
  } = useRouter()

  const [translators] = useTranslators({
    token: user?.access_token,
    code,
  })
  const [project] = useProject({
    token: user?.access_token,
    code,
  })
  const [currentTranslator, setCurrentTranslator] = useState(null)
  const [isHighlight, setIsHighlight] = useState(false)

  const colorTranslators = translators?.map((el, index) => {
    return { ...el, color: defaultColor[index] }
  })
  const [versesDivider, setVersesDivider] = useState([])
  useEffect(() => {
    setVersesDivider(verses)
  }, [verses])

  const coloring = (index) => {
    const newArr = [...versesDivider]
    newArr[index] = {
      ...newArr[index],
      translator_name: currentTranslator?.users?.login,
      project_translator_id: currentTranslator?.id,
      color: currentTranslator?.color,
    }
    setVersesDivider(newArr)
  }
  const verseDividing = async () => {
    let { data, error } = await supabase.rpc('divide_verses', {
      divider: versesDivider,
      project_id: project?.id,
    })

    if (error) console.error(error)
    else console.log(data)
  }

  return (
    <div className="md:flex mx-4">
      <div
        onMouseDown={() => {
          setIsHighlight(true)
        }}
        onMouseUp={() => setIsHighlight(false)}
        className="select-none lg:grid-cols-6 grid-cols-4 grid"
      >
        {versesDivider
          .sort((a, b) => a.num - b.num)
          .map((el, index) => {
            return (
              <div
                onMouseDown={() => {
                  if (currentTranslator !== null) {
                    coloring(index)
                  }
                }}
                onMouseOver={() => {
                  if (isHighlight && currentTranslator !== null) {
                    coloring(index)
                  }
                }}
                onClick={() => {
                  if (currentTranslator === null) {
                    return
                  }
                  coloring(index)
                }}
                className={`${
                  el?.color ?? 'bg-slate-300'
                } w-32 border-slate-200 border-2 cursor-pointer hover:border-1 hover:border-cyan-300 truncate flex justify-between p-1`}
                key={index}
              >
                <div>{el.num}</div>
                <div>{el.translator_name}</div>
              </div>
            )
          })}
      </div>
      <div className="grid grid-cols-2 md:block">
        {colorTranslators?.map((el, index) => (
          <div key={index} className="flex">
            <div
              onClick={() => setCurrentTranslator(el)}
              className={`${
                currentTranslator?.users?.login === el.users.login
                  ? 'border-4 border-cyan-300 p-1'
                  : 'p-2'
              } cursor-pointer ml-10 my-2 w-fit rounded-md ${el.color}`}
            >
              {el.users.login}
            </div>
          </div>
        ))}
        <button
          onClick={() =>
            setCurrentTranslator((prev) => {
              return { ...prev, users: { login: '' }, color: ' bg-slate-300' }
            })
          }
          className={`${
            currentTranslator?.users?.login === ''
              ? 'border-4 border-cyan-300 p-1'
              : 'p-2'
          } bg-slate-300 cursor-pointer ml-10 p-2 my-2 w-fit rounded-md`}
        >
          Clearing
        </button>
        <button
          onClick={() => setVersesDivider(verses)}
          className={`bg-slate-400 cursor-pointer ml-10 p-2 my-2 w-fit rounded-md`}
        >
          Reset
        </button>
        <button
          onClick={() => verseDividing()}
          className={`bg-green-400 cursor-pointer ml-10 p-2 my-2 w-fit rounded-md`}
        >
          Save
        </button>
      </div>
    </div>
  )
}

export default VerseDistributor
