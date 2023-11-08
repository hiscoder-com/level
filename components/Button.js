const colors = {
  primary: {
    text: 'text-th-text-primary',
    active: 'active:bg-th-text-primary',
    hover: 'group-hover:bg-th-text-primary',
    border: 'border-th-text-primary',
  },
  secondary: {
    text: 'text-th-secondary',
    active: 'active:bg-th-secondary',
    hover: 'group-hover:bg-th-secondary',
    border: 'border-th-secondary',
  },
  tertiary: {
    text: 'text-th-primary-100',
    active: 'active:bg-th-primary-100',
    hover: 'group-hover:bg-th-primary-100',
    border: 'border-th-primary-100',
  },
}
function Button({ onClick, text, color, icon, disabled = false, avatar = '' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group flex flex-row items-center w-full p-2 cursor-pointer ${colors[color].border} border-2 rounded-2xl font-semibold text-sm md:text-xl ${colors[color].text} hover:shadow-md active:text-th-secondary-10 ${colors[color].active}`}
    >
      <div className="avatar-block w-0 md:w-10 flex-grow-0">{avatar}</div>
      <div className="text-block flex-auto ml-2 overflow-hidden text-left text-ellipsis">
        {text}
      </div>
      <div className="icon-block flex-grow-0">
        <div
          className={`p-2 ${colors[color].border} border-2 rounded-full ${colors[color].hover} group-hover:text-th-secondary-10 group-active:border-th-secontext-th-secondary-10`}
        >
          {icon}
        </div>
      </div>
    </button>
  )
}

export default Button
