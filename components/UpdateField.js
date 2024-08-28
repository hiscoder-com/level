import { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { calculateRtlDirection } from '@texttree/notepad-rcl'

function UpdateField({
  index,
  subIndex,
  value,
  access,
  updateValue,
  fieldName,
  className,
  textarea = false,
  editable = true,
}) {
  const { t } = useTranslation(['project-edit'])

  const [valueField, setValueField] = useState(value)
  const [direction, setDirection] = useState(calculateRtlDirection(value))
  useEffect(() => {
    if (value !== undefined && value !== null) {
      setValueField(value)
    }
  }, [value])
  const props = {
    className,
    value: valueField ?? '',
    onChange: (e) => {
      setValueField(e.target.value)
      setDirection(calculateRtlDirection(e.target.value))
    },
    onBlur: () => {
      updateValue({ value: valueField?.trim(), index, subIndex, fieldName })
    },
    disabled: !editable,
    rows: 6,
    placeholder: access ? t('enterText') : '',
    dir: direction,
  }
  return <>{textarea ? <textarea {...props} /> : <input {...props} />}</>
}

export default UpdateField
