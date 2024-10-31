import EyeIcon from 'public/icons/eye-icon.svg'
import EyeOffIcon from 'public/icons/eye-off-icon.svg'

function InputField({
  setShowPassword,
  onChange,
  value,
  name,
  id,
  type,
  label,
  refInput,
  className = '',
  isError = false,
  showPassword = false,
  showPasswordToggle = false,
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
          placeholder={label}
          onChange={onChange}
          {...props}
        />
      ) : (
        <input
          ref={refInput}
          className={finalClassName}
          type={showPassword ? 'text' : type}
          name={name}
          id={id}
          value={value}
          placeholder={label}
          onChange={onChange}
          {...props}
        />
      )}

      {showPasswordToggle && (
        <span
          className="absolute bottom-4 right-4 cursor-pointer stroke-th-text-primary stroke-2"
          onClick={() => setShowPassword && setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </span>
      )}
    </div>
  )
}

export default InputField
