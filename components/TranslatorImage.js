const defaultColor = ['#27AE60', '#03A9F4', '#023047', '#7DAE27', '#27AE9B', '#9D27AE']

function TranslatorImage({ item }) {
  return (
    <>
      {item.avatar ? (
        <>
          <div
            style={{ backgroundImage: 'url(' + item.url + ')' }}
            className={
              'w-[34px] h-[34px] rounded-full border-2 bg-contain bg-center bg-no-repeat'
            }
          ></div>
          <span
            className={`absolute w-1.5 h-1.5 ml-[27px] -mt-[30px] rounded-full ${
              item.status ? 'bg-green-500' : 'bg-red-500'
            }`}
          ></span>
        </>
      ) : (
        <div
          title={`${item.users.login} ${item.users.email}`}
          className="relative border-2 rounded-full cursor-default select-none"
        >
          <svg
            viewBox="0 0 168 168"
            fill="white"
            width="34px"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="84"
              cy="84"
              r="50%"
              fill={defaultColor[item.users.login.length % 6]}
            />
            <text
              x="50%"
              y="65%"
              textAnchor="middle"
              className="text-7xl text-white font-bold"
            >
              {item.users.login.toUpperCase().slice(0, 2)}
            </text>
          </svg>
          <span
            className={`absolute w-[17.68%] h-[17.68%] ml-[76.47%] -mt-[95%] rounded-full ${
              item.status ? 'bg-green-500' : 'bg-red-500'
            }`}
          ></span>
        </div>
      )}
    </>
  )
}

export default TranslatorImage
