export default function PauseButton({ isPaused, isRecording, onPause, onResume }) {
  return (
    <button
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-th-text-primary transition-all duration-150 disabled:bg-gray-400 ${
        isRecording ? 'hover:opacity-70' : ''
      }`}
      disabled={!isRecording}
      onClick={isPaused ? onResume : onPause}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="#FFFFFF"
        className="h-[18px] w-[18px]"
      >
        <path
          fillRule="evenodd"
          d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  )
}
