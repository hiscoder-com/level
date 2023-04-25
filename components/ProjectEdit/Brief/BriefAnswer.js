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
      placeholder={access && t('project-edit:enterText')}
      className="outline-none pr-2 w-full resize-none"
    />
  )
}

export default BriefAnswer
