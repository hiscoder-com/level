import { useEffect, useState } from 'react'
import ReactTextareaAutosize from 'react-textarea-autosize'

function BriefResume({
  index,
  saveToDatabase,
  highLevelAccess,
  t,
  updateBrief,
  briefItem,
}) {
  const [startValue, setStartValue] = useState(false)

  // data initialization
  useEffect(() => {
    if (startValue === false) {
      setStartValue(briefItem.resume?.trim())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [briefItem.resume])

  return (
    <ReactTextareaAutosize
      value={startValue}
      onChange={(e) => updateBrief(e.target.value.trim(), index)}
      className="outline-none w-full resize-none"
      onBlur={() => {
        setTimeout(() => saveToDatabase(), 2000)
      }}
      readOnly={highLevelAccess ? false : true}
      // placeholder={highLevelAccess && t('project-edit:enterText')}
    />
  )
}

export default BriefResume

// const resume = (
//   <TextareaAutosize
//     onBlur={() => {
//       setTimeout(() => saveToDatabase(), 2000)
//     }}
//     readOnly={highLevelAccess ? false : true}
//     placeholder={highLevelAccess && t('project-edit:enterText')}
//     defaultValue={briefItem.resume}
//     onChange={(e) => {
//       setBriefDataCollection((prev) => {
//         prev[index] = {
//           ...prev[index],
//           resume: e.target.value.trim(),
//         }
//         return prev
//       })
//     }}
//     className="outline-none w-full resize-none"
//   />
// )
