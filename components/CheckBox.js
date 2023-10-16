import CheckboxShevron from 'public/checkbox-shevron.svg'
import { forwardRef } from 'react'

const CheckBox = forwardRef(
  (
    {
      className = {
        cursor:
          'text-th-secondary-background stroke-th-secondary-background fill-th-secondary-background',
        accent: '',
        wrapper: '',
      },
      label,
      id = 'checkBox',
      ...props
    },
    ref
  ) => (
    <div className={`flex items-center ${className.wrapper}`}>
      <label
        className="relative flex cursor-pointer items-center rounded-full p-3"
        htmlFor={id}
      >
        <input
          id={id}
          type="checkbox"
          className={`w-6 h-6 shadow-sm before:content[''] peer relative cursor-pointer appearance-none rounded-md border border-th-primary-border transition-all before:absolute before:top-1/2 before:left-1/2 before:block before:-translate-y-1/2 before:-translate-x-1/2 before:rounded-full before:opacity-0 before:transition-opacity hover:before:opacity-10 ${className.accent}`}
          ref={ref}
          {...props}
        />
        <div
          className={`pointer-events-none absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2  opacity-0 transition-opacity peer-checked:opacity-100  ${className.cursor}`}
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
