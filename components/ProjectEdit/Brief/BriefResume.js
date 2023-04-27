import { useEffect, useState } from 'react'
import ReactTextareaAutosize from 'react-textarea-autosize'

function BriefResume({ access, saveToDatabase, updateBrief, objResume, index, t }) {
  const [resume, setResume] = useState(objResume)

  useEffect(() => {
    setResume(objResume)
  }, [objResume])

  return (
    <ReactTextareaAutosize
      value={resume}
      onChange={(e) => setResume(e.target.value)}
      className={`w-full p-2 rounded-lg bg-white text-slate-900 border ${
        resume ? 'border-slate-900' : 'border-blue-200'
      } placeholder-blue-200 focus:border-slate-900 focus:outline-none`}
      onBlur={() => {
        updateBrief(resume.trim(), index)
        setTimeout(saveToDatabase, 1000)
      }}
      readOnly={!access}
      placeholder={access ? t('project-edit:enterText') : ''}
    />
  )
}

export default BriefResume
