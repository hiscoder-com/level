import { useCurrentUser } from 'lib/UserContext'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useTranslators } from 'utils/hooks'
const defaultColor = [
  'bg-blue-400',
  'bg-yellow-400',
  'bg-red-400',
  'bg-green-400',
  'bg-violet-400',
]

function VerseDistributor() {
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
  const falseverses = [...Array(100)].map((_, index) => {
    return { num: index + 1, name: '' }
  })

  const [verses, setVerses] = useState(falseverses)

  return (
    <div className="flex">
      <div
        onMouseDown={() => setStartSelection(true)}
        onMouseUp={() => setStartSelection(false)}
        className="noselect   grid-cols-6 grid "
      >
        {verses.map((el, index) => {
          return (
            <div
              onMouseOver={() => {
                if (startSelection) {
                  const newArr = [...verses]
                  newArr[index] = {
                    num: index + 1,
                    name: currentTranslator?.users?.login,
                    color: currentTranslator?.color,
                  }
                  setVerses(newArr)
                }
              }}
              onClick={() => {
                if (currentTranslator === null) {
                  return
                }
                const newArr = [...verses]
                newArr[index] = {
                  num: index + 1,
                  name: currentTranslator?.users?.login,
                  color: currentTranslator?.color,
                }
                setVerses(newArr)
              }}
              className={`${
                el?.color ?? ' bg-slate-300'
              }  w-36 border-slate-200 border-2 cursor-pointer`}
              key={index}
            >
              {el.num + el.name}
            </div>
          )
        })}
      </div>
      <div>
        {colorTranslators?.map((el, index) => (
          <div key={index} className="flex">
            <div
              onClick={() => setCurrentTranslator(el)}
              className={`${
                currentTranslator === el.users.login ? 'bg-gray-100' : el.color
              } cursor-pointer ml-10 p-2 my-2 w-fit rounded-md`}
            >
              {el.users.login}
            </div>
            <div className="w-40 break-words">
              {verses
                .filter((verse) => verse.name === el.users.login)
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
          className={`bg-slate-400 cursor-pointer ml-10 p-2 my-2 w-fit rounded-md`}
        >
          Clearing
        </button>
        <button
          onClick={() => setVerses(falseverses)}
          className={`bg-slate-400 cursor-pointer ml-10 p-2 my-2 w-fit rounded-md`}
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export default VerseDistributor
