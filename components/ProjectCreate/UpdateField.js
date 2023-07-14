import { useEffect, useState } from 'react'
import ReactTextareaAutosize from 'react-textarea-autosize'

function UpdateField({
  index,
  subIndex,
  value,
  update,
  type,
  textarea = false,
  editable = true,
  array,
  name,
  setArray,
  access,
  t,
}) {
  const [valueField, setValueField] = useState(value)
  useEffect(() => {
    if (value) {
      console.log({ value })
      setValueField(value)
    }
  }, [value])
  const props = {
    className: 'input-primary',
    value: valueField,
    onChange: (e) => setValueField(e.target.value),
    onBlur: () => {
      update({
        ref: { [type]: valueField.trim() },
        index,
        array,
        name,
        setArray,
        subIndex,
      })
    },
    disabled: !editable,
    rows: 6,
    placeholder: access ? t('project-edit:enterText') : '',
  }
  return (
    <>
      {textarea ? (
        <ReactTextareaAutosize {...props} />
      ) : (
        <ReactTextareaAutosize {...props} />
      )}
    </>
  )
}

export default UpdateField
