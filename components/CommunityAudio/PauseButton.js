import AudioPause from 'public/icons/audioPause.svg'

export default function PauseButton({ isPaused, isRecording, onPause, onResume }) {
  return (
    <button
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-th-text-primary transition-all duration-150 disabled:bg-gray-400 ${
        isRecording ? 'hover:opacity-70' : ''
      }`}
      disabled={!isRecording}
      onClick={isPaused ? onResume : onPause}
    >
      <AudioPause className="h-[18px] w-[18px]" />
    </button>
  )
}
