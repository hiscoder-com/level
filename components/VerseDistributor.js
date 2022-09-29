import { useState } from 'react'

function VerseDistributor() {
  const [currentTranslator, setCurrentTranslator] = useState(null)

  const translators = [
    { login: 'Dima' },
    { login: 'Timur' },
    { login: 'Pasha' },
    { login: 'Victor' },
  ]
  const falseverses = [...Array(100)].map((_, index) => {
    return { num: index + 1, name: '' }
  })

  const [verses, setVerses] = useState(falseverses)

  console.log(currentTranslator)
  return (
    <div className="flex">
      <div className="  w-96 grid-cols-6 grid ">
        {verses.map((el, index) => {
          return (
            <div
              onClick={() => {
                if (!currentTranslator) {
                  return
                }
                const newArr = [...verses]
                newArr[index] = { num: index + 1, name: currentTranslator }
                setVerses(newArr)
              }}
              className="bg-slate-400 border-slate-200 border-2 cursor-pointer"
              key={index}
            >
              {el.num + el.name}
            </div>
          )
        })}
      </div>
      <div>
        {translators.map((el, index) => (
          <div key={index} className="flex">
            <div
              onClick={() => setCurrentTranslator(el.login)}
              className={`${
                currentTranslator === el.login ? 'bg-red-400' : 'bg-yellow-400'
              } cursor-pointer ml-10 p-2 my-2  w-fit`}
            >
              {el.login}
            </div>
            <div>
              {verses
                .filter((verse) => verse.name === el.login)
                ?.map((item) => item.num)
                .join(',')}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default VerseDistributor
