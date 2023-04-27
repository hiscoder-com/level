import { useEffect, useState } from 'react'
import ReactTextareaAutosize from 'react-textarea-autosize'

function BriefAnswer({
  access,
  saveToDatabase,
  updateObjQA,
  blockIndex,
  briefItem,
  objQA,
  index,
  t,
}) {
  const [answer, setAnswer] = useState(objQA.answer)

  useEffect(() => {
    setAnswer(objQA.answer)
  }, [objQA.answer])

  return (
    <ReactTextareaAutosize
      value={answer}
      onChange={(e) => setAnswer(e.target.value)}
      onBlur={() => {
        updateObjQA(answer.trim(), briefItem, blockIndex, objQA, index)
        setTimeout(saveToDatabase, 1000)
      }}
      readOnly={!access}
      placeholder={access ? t('project-edit:Answer') : ''}
      className={`w-full p-2 rounded-lg bg-white text-slate-900 border ${
        answer ? 'border-slate-900' : 'border-blue-200'
      } placeholder-blue-200 focus:border-slate-900 focus:outline-none`}
    />
  )
}

export default BriefAnswer
