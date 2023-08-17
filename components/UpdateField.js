import { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'

function UpdateField({
  index,
  subIndex,
  value,
  textarea = false,
  editable = true,
  access,
  updateValue,
  fieldName,
  className,
}) {
  const { t } = useTranslation(['project-edit'])

  const [valueField, setValueField] = useState(value)
  useEffect(() => {
    if (value) {
      setValueField(value)
    }
  }, [value])
  const props = {
    className,
    value: valueField,
    onChange: (e) => setValueField(e.target.value),
    onBlur: () => {
      updateValue({ value: valueField.trim(), index, subIndex, fieldName })
    },
    disabled: !editable,
    rows: 6,
    placeholder: access ? t('enterText') : '',
  }
  return <>{textarea ? <textarea {...props} /> : <input {...props} />}</>
}

export default UpdateField
