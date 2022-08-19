const defaultColor = ['#27AE60', '#03A9F4', '#023047', '#7DAE27', '#27AE9B', '#9D27AE']

function TranslatorImage({ item, size }) {
  return (
    <div
      title={`${item.users ? `${item.users?.login} ${item.users?.email}` : ''}`}
      className="relative border-2 rounded-full cursor-default select-none"
    >
      {item.avatar ? (
        <div
          style={{
            backgroundImage: 'url(' + item?.url + ')',
            width: size,
            height: size,
          }}
          className={`relative rounded-full bg-contain bg-center bg-no-repeat`}
        ></div>
      ) : (
        <svg
          viewBox="0 0 168 168"
          fill="white"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="84"
            cy="84"
            r="84"
            fill={defaultColor[item.users.login.length % 6]}
          />
          <text
            x="84"
            y="110"
            textAnchor="middle"
            className="text-7xl text-white font-bold"
          >
            {item.users.login.toUpperCase().slice(0, 2)}
          </text>
        </svg>
      )}
      <span
        className={`absolute w-[17.68%] h-[17.68%] ml-[80%] -mt-[97%] rounded-full ${
          item.status ? 'bg-green-500' : 'bg-red-500'
        }`}
      ></span>
    </div>
  )
}

export default TranslatorImage
