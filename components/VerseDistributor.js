import { useCurrentUser } from 'lib/UserContext'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useTranslators } from 'utils/hooks'
import { supabase } from 'utils/supabaseClient'
const defaultColor = [
  'bg-blue-400',
  'bg-yellow-400',
  'bg-red-400',
  'bg-green-400',
  'bg-violet-400',
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
  const [currentTranslator, setCurrentTranslator] = useState(null)
  const [startSelection, setStartSelection] = useState(false)

  const colorTranslators = translators?.map((el, index) => {
    return { ...el, color: defaultColor[index] }
  })
  console.log(colorTranslators)
  const [versesDistibutor, setVersesDistibutor] = useState([])
  useEffect(() => {
    setVersesDistibutor(verses)
  }, [verses])

  const coloring = (index) => {
    const newArr = [...versesDistibutor]
    newArr[index] = {
      ...newArr[index],
      translator_name: currentTranslator?.users?.login,
      project_translator_id: currentTranslator?.users?.id,
      color: currentTranslator?.color,
    }
    setVersesDistibutor(newArr)
  }
  console.log(versesDistibutor)
  const verseDistributing = async () => {
    const { data, error } = await supabase.from('verses').upsert([
      { id: 1, project_translator_id: '123' },
      { id: 2, project_translator_id: '345' },
    ])
    console.log(error, data)
  }

  return (
    <div className="md:flex mx-4">
      <div
        onMouseDown={() => {
          setStartSelection(true)
        }}
        onMouseUp={() => setStartSelection(false)}
        className="noselect grid-cols-6 grid"
      >
        {versesDistibutor.map((el, index) => {
          return (
            <div
              onMouseDown={() => {
                if (currentTranslator !== null) {
                  coloring(index)
                }
              }}
              onMouseOver={() => {
                if (startSelection && currentTranslator !== null) {
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
                el?.color ?? ' bg-slate-300'
              }   w-32 border-slate-200 border-2 cursor-pointer hover:border-1 hover:border-cyan-300 truncate`}
              key={index}
            >
              {el.num}
              {el.translator_name}
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
              } cursor-pointer ml-10  my-2 w-fit rounded-md ${el.color}`}
            >
              {el.users.login}
            </div>
            <div className="w-40 break-words">
              {versesDistibutor
                .filter((verse) => verse?.translator?.name === el.users.login)
                ?.map((item) => item.num)
                .join(',')}
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
          onClick={() => setVersesDistibutor(verses)}
          className={`bg-slate-400 cursor-pointer ml-10 p-2 my-2 w-fit rounded-md`}
        >
          Reset
        </button>
        <button
          onClick={() => verseDistributing()}
          className={`bg-green-400 cursor-pointer ml-10 p-2 my-2 w-fit rounded-md`}
        >
          Save
        </button>
      </div>
    </div>
  )
}

export default VerseDistributor
