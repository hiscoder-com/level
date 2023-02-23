import { useEffect, useState } from 'react'
import ReactTextareaAutosize from 'react-textarea-autosize'

function BriefResume({
  highLevelAccess,
  saveToDatabase,
  updateBrief,
  objResume,
  index,
  t,
}) {
  const [resume, setResume] = useState(objResume)

  // data initialization
  useEffect(() => {
    setResume(objResume)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objResume])

  return (
    <ReactTextareaAutosize
      value={resume}
      onChange={(e) => {
        setResume(e.target.value)
      }}
      className="outline-none w-full resize-none"
      onBlur={() => {
        updateBrief(resume.trim(), index)
        setTimeout(() => saveToDatabase(), 1000)
      }}
      readOnly={highLevelAccess ? false : true}
      placeholder={highLevelAccess ? t('project-edit:enterText') : ''}
    />
  )
}

export default BriefResume
