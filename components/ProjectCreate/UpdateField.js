import { useEffect, useState } from 'react'

function UpdateField({
  value,
  updateCollection,
  index,
  type,
  textarea = false,
  editable = true,
  collection,
  name,
  setter,
}) {
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
      updateCollection({
        ref: { [type]: valueField.trim() },
        index,
        array: collection,
        name,
        setter,
      })
    },
    disabled: !editable,
    rows: 6,
  }
  return <>{textarea ? <textarea {...props} /> : <input {...props} />}</>
}

export default UpdateField
