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
      className={`group flex flex-row items-center w-full p-2 cursor-pointer ${colors[color].border} border-2 rounded-2xl font-semibold text-sm md:text-xl ${colors[color].text} hover:shadow-md active:text-white ${colors[color].active}`}
    >
      <div className="avatar-block w-0 md:w-10 flex-grow-0">{avatar}</div>
      <div className="text-block flex-auto ml-2 overflow-hidden text-left text-ellipsis">
        {text}
      </div>
      <div className="icon-block flex-grow-0">
        <div
          className={`p-2 ${colors[color].border} border-2 rounded-full ${colors[color].hover} group-hover:text-white group-active:border-white`}
        >
          {icon}
        </div>
      </div>
    </button>
  )
}

export default Button
