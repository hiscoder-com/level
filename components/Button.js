const colors = {
  red: {
    text: 'text-red-500',
    active: 'active:bg-red-500',
    hover: 'group-hover:bg-red-500',
    border: 'border-red-500',
  },
  green: {
    text: 'text-green-500',
    active: 'active:bg-green-500',
    hover: 'group-hover:bg-green-500',
    border: 'border-green-500',
  },
  amber: {
    text: 'text-amber-500',
    active: 'active:bg-amber-500',
    hover: 'group-hover:bg-amber-500',
    border: 'border-amber-500',
  },
}
function Button({ onClick, text, color, icon, disabled = false, avatar = '' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${colors[color].border} ${colors[color].text} border-2 cursor-pointer p-2 w-full items-center rounded-2xl flex flex-row font-semibold text-xl group hover:shadow-md active:text-white ${colors[color].active}`}
    >
      <div className="avatar-block w-10 flex-grow-0">{avatar}</div>
      <div className="text-block ml-2 flex-auto text-left">{text}</div>
      <div className="icon-block flex-grow-0">
        <div
          className={`${colors[color].border} border-2 rounded-full p-2 ${colors[color].hover} group-hover:text-white group-active:border-white`}
        >
          {icon}
        </div>
      </div>
    </button>
  )
}

export default Button
