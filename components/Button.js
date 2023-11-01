const colors = {
  black: {
    text: 'text-th-text-primary',
    active: 'active:bg-th-text-primary',
    hover: 'group-hover:bg-th-text-primary',
    border: 'border-th-text-primary',
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
      className={`group flex flex-row items-center w-full p-2 cursor-pointer ${colors[color].border} border-2 rounded-2xl font-semibold text-sm md:text-xl ${colors[color].text} hover:shadow-md active:text-th-background-secondary ${colors[color].active}`}
    >
      <div className="avatar-block w-0 md:w-10 flex-grow-0">{avatar}</div>
      <div className="text-block flex-auto ml-2 overflow-hidden text-left text-ellipsis">
        {text}
      </div>
      <div className="icon-block flex-grow-0">
        <div
          className={`p-2 ${colors[color].border} border-2 rounded-full ${colors[color].hover} group-hover:text-th-background-secondary group-active:border-th-secontext-th-background-secondary`}
        >
          {icon}
        </div>
      </div>
    </button>
  )
}

export default Button
