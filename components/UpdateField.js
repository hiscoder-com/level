import { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'
import ReactTextareaAutosize from 'react-textarea-autosize'

function UpdateField({
  index,
  subIndex,
  value,
  textarea = false,
  editable = true,
  access,
  updateValue,
  fieldName,
}) {
  const { t } = useTranslation(['project-edit'])

  const [valueField, setValueField] = useState(value)
  useEffect(() => {
    if (value) {
      setValueField(value)
    }
  }, [value])
  const props = {
    className: 'input-primary',
    value: valueField,
    onChange: (e) => setValueField(e.target.value),
    onBlur: () => {
      updateValue({ value: valueField.trim(), index, subIndex, fieldName })
    },
    disabled: !editable,
    rows: 6,
    placeholder: access ? t('enterText') : '',
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
