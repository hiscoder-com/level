export default function StopButton({ isRecording, stopRecording }) {
  return (
    <button
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-th-text-primary transition-all duration-150 disabled:bg-gray-400 ${
        isRecording ? 'hover:opacity-70' : ''
      }`}
      disabled={!isRecording}
      onClick={stopRecording}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="#FFFFFF"
        className="h-[18px] w-[18px]"
      >
        <path
          fillRule="evenodd"
          d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  )
}
