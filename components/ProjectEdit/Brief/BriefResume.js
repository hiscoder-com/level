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

  useEffect(() => {
    setResume(objResume)
  }, [objResume])

  return (
    <ReactTextareaAutosize
      value={resume}
      onChange={(e) => {
        setResume(e.target.value)
      }}
      className="outline-none pr-2 w-full h5 resize-none"
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
