import Stop from 'public/icons/audioStop.svg'

export default function StopButton({ isRecording, stopRecording }) {
  return (
    <button
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-th-text-primary transition-all duration-150 disabled:bg-gray-400 ${
        isRecording ? 'hover:opacity-70' : ''
      }`}
      disabled={!isRecording}
      onClick={stopRecording}
    >
      <Stop />
    </button>
  )
}
