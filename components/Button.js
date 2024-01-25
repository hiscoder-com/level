const colors = {
  primary: {
    text: 'text-th-text-primary',
    active: 'active:bg-th-text-primary',
    hover: 'group-hover:bg-th-text-primary',
    border: 'border-th-text-primary',
  },
  secondary: {
    text: 'text-th-secondary-400',
    active: 'active:bg-th-secondary-400',
    hover: 'group-hover:bg-th-secondary-400',
    border: 'border-th-secondary-400',
  },
  tertiary: {
    text: 'text-th-primary-100',
    active: 'active:bg-th-primary-100',
    hover: 'group-hover:bg-th-primary-100',
    border: 'border-th-primary-100',
  },
  disable: {
    text: 'text-th-secondary-300',
    border: 'border-th-secondary-300',
  },
}
function Button({
  onClick,
  text,
  color,
  icon,
  disabled = false,
  avatar = '',
  hidden = false,
}) {
  if (hidden) {
    return null
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group flex flex-row items-center w-full p-2 cursor-pointer ${
        colors[color].border
      } border-2 rounded-2xl font-semibold text-sm md:text-xl ${colors[color].text} ${
        !disabled ? 'hover:shadow-md' : ''
      } ${!disabled ? colors[color].hover : ''} ${
        !disabled ? 'active:text-th-secondary-10' : ''
      } ${!disabled ? colors[color].active : ''}`}
    >
      <div className="avatar-block w-0 md:w-10 flex-grow-0">{avatar}</div>
      <div className="text-block flex-auto ml-2 overflow-hidden text-left text-ellipsis">
        {text}
      </div>
      <div className="icon-block flex-grow-0">
        <div
          className={`p-2 ${colors[color].border} border-2 rounded-full ${
            !disabled ? colors[color].hover : ''
          } ${
            !disabled
              ? 'group-hover:text-th-secondary-100 group-active:border-th-secondary-10 stroke-th-text-primary'
              : ''
          }`}
        >
          {icon}
        </div>
      </div>
    </button>
  )
}

export default Button
