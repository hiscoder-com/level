const colors = {
  black: {
    text: 'text-th-primary-text',
    active: 'active:bg-th-primary-text',
    hover: 'group-hover:bg-th-primary-text',
    border: 'border-th-primary-text',
  },
  green: {
    text: 'text-th-primary',
    active: 'active:bg-th-primary',
    hover: 'group-hover:bg-th-primary',
    border: 'border-th-primary',
  },
  yellow: {
    text: 'text-th-secondary',
    active: 'active:bg-th-secondary',
    hover: 'group-hover:bg-th-secondary',
    border: 'border-th-secondary',
  },
}
function Button({ onClick, text, color, icon, disabled = false, avatar = '' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group flex flex-row items-center w-full p-2 cursor-pointer ${colors[color].border} border-2 rounded-2xl font-semibold text-sm md:text-xl ${colors[color].text} hover:shadow-md active:text-th-secondary-background ${colors[color].active}`}
    >
      <div className="avatar-block w-0 md:w-10 flex-grow-0">{avatar}</div>
      <div className="text-block flex-auto ml-2 overflow-hidden text-left text-ellipsis">
        {text}
      </div>
      <div className="icon-block flex-grow-0">
        <div
          className={`p-2 ${colors[color].border} border-2 rounded-full ${colors[color].hover} group-hover:text-th-secondary-background group-active:border-th-secontext-th-secondary-background`}
        >
          {icon}
        </div>
      </div>
    </button>
  )
}

export default Button
