import { forwardRef } from 'react'

import CheckboxShevron from 'public/checkbox-shevron.svg'

const CheckBox = forwardRef(
  (
    {
      className = {
        cursor: 'text-th-secondary-10 stroke-th-secondary-10 fill-th-secondary-10',
        accent:
          'bg-th-secondary-10 checked:bg-th-secondary-400 checked:border-th-secondary-400 checked:before:bg-th-secondary-400 border-th-secondary',
        wrapper: 'flex-row-reverse justify-between',
      },
      label,
      id = 'checkBox',
      ...props
    },
    ref
  ) => (
    <div className={`flex items-center gap-3 ${className.wrapper}`}>
      <label
        className="relative flex cursor-pointer items-center rounded-full"
        htmlFor={id}
      >
        <input
          id={id}
          type="checkbox"
          className={`before:content[''] peer relative h-6 w-6 cursor-pointer appearance-none rounded-md border border-th-secondary-300 shadow-sm transition-all before:absolute before:left-1/2 before:top-1/2 before:block before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:opacity-0 before:transition-opacity hover:before:opacity-10 ${className.accent}`}
          ref={ref}
          {...props}
        />
        <div
          className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity peer-checked:opacity-100 ${className.cursor}`}
        >
          <CheckboxShevron />
        </div>
      </label>
      <label htmlFor={id}>{label}</label>
    </div>
  )
)
CheckBox.displayName = 'CheckBox'
export default CheckBox
