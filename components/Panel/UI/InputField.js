import EyeIcon from 'public/eye-icon.svg'
import EyeOffIcon from 'public/eye-off-icon.svg'

function InputField({
  showPasswordToggle = false,
  showPassword = false,
  setShowPassword,
  value,
  onChange,
  name,
  type,
  id,
  label,
  isError = false,
  className = '',
  refInput,
  ...props
}) {
  const baseClassName = 'input-base-label peer'
  const errorClassName = 'text-th-invalid border-th-invalid'
  const normalClassName = 'text-th-text-primary border-th-primary-400'
  const finalClassName = `${baseClassName} ${
    isError ? errorClassName : normalClassName
  } ${className}`

  const isTextarea = type === 'textarea'

  return (
    <div className="relative z-0 w-full">
      {isTextarea ? (
        <textarea
          ref={refInput}
          className={finalClassName}
          name={name}
          id={id}
          value={value}
          placeholder=""
          onChange={onChange}
          {...props}
        />
      ) : (
        <input
          ref={refInput}
          className={finalClassName}
          type={showPassword ? 'text' : type}
          // type={type} было
          name={name}
          id={id}
          value={value}
          placeholder=""
          onChange={onChange}
          {...props}
        />
      )}

      <label
        htmlFor={id}
        className={`label-base ${isError ? 'text-th-invalid' : 'text-th-text-primary'}`}
      >
        {label}
      </label>
      {showPasswordToggle && (
        <span
          className="absolute right-4 bottom-4 cursor-pointer stroke-2 stroke-th-text-primary"
          onClick={() => setShowPassword && setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </span>
      )}
    </div>
  )
}

export default InputField
