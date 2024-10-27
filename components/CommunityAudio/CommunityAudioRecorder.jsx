import { useState } from 'react'

function CommunityAudioRecorder() {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div className="card flex justify-between w-full gap-3 sm:gap-7 bg-th-secondary-10 !pb-4">
      <div className="flex flex-col gap-4 justify-between">
        <SpeedSetting />
        <FontSizeSetting />
      </div>
      <div className="flex items-end">
        <button
          className="flex justify-center items-center bg-th-text-primary rounded-full w-10 h-10 disabled:bg-gray-400"
          disabled={!isPlaying}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="#FFFFFF"
            className="size-6 w-4 h-4"
          >
            <path
              fillRule="evenodd"
              d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <button
          className={`flex justify-center items-center rounded-full w-20 h-20 ${
            isPlaying ? 'bg-red-500' : 'bg-th-primary-100'
          }`}
          onClick={() => setIsPlaying(!isPlaying)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="#FFFFFF"
            className="size-6 w-10 h-10"
          >
            <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
            <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
          </svg>
        </button>
        <button
          className="flex justify-center items-center bg-th-text-primary rounded-full w-10 h-10 disabled:bg-gray-400"
          disabled={!isPlaying}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="#FFFFFF"
            className="size-6 w-4 h-4"
          >
            <path
              fillRule="evenodd"
              d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      <div className="flex items-center">
        <div className="flex items-center border border-th-text-primary p-2 rounded-full gap-2">
          <p>FILENAME</p>
          <button>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-6 w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button className="p-2 bg-th-text-primary rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="#FFFFFF"
              className="size-6 h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default CommunityAudioRecorder

function SpeedSetting() {
  const [speed, setSpeed] = useState(1)

  return (
    <div className="flex gap-2 items-center space-x-2">
      <div className="grid grid-cols-2 w-20 h-10 border border-th-primary-100 rounded-full overflow-hidden">
        <button
          className="flex justify-center items-center border border-e-th-primary-100 disabled:opacity-70"
          onClick={() => setSpeed(speed - 1)}
          disabled={speed === 1}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 w-3 h-3"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
          </svg>
        </button>
        <button
          className="flex justify-center items-center"
          onClick={() => setSpeed(speed + 1)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={3}
            stroke="currentColor"
            className="size-6 w-3 h-3"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </button>
      </div>
      <div className="flex items-center text-sm">
        <p>
          <span className="font-semibold">{speed}</span> Прокрутка текста
        </p>
      </div>
    </div>
  )
}

function FontSizeSetting() {
  const [fontSize, setFontSize] = useState(16)

  return (
    <div className="flex gap-2 items-center space-x-2">
      <div className="grid grid-cols-2 w-20 h-10 border border-th-primary-100 rounded-full overflow-hidden">
        <button
          className="flex justify-center items-center border border-e-th-primary-100 text-xs disabled:opacity-70"
          onClick={() => setFontSize(fontSize - 1)}
          disabled={fontSize === 12}
        >
          A
        </button>
        <button
          className="flex justify-center items-center"
          onClick={() => setFontSize(fontSize + 1)}
        >
          A
        </button>
      </div>
      <div className="flex items-center text-sm">
        <p>
          <span className="font-semibold">{fontSize}</span> Размер текста
        </p>
      </div>
    </div>
  )
}
