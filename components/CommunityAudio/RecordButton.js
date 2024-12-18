import Record from 'public/icons/audioRecord.svg'

export default function RecordButton({
  isPaused,
  isRecording,
  startRecording,
  resumeRecording,
}) {
  return (
    <button
      className={`flex h-20 w-20 items-center justify-center rounded-full transition-all duration-150 ${
        isPaused
          ? 'bg-th-secondary-400 hover:opacity-70'
          : isRecording
            ? 'bg-red-500'
            : 'bg-th-primary-100 hover:opacity-70'
      }`}
      onClick={isPaused ? resumeRecording : startRecording}
    >
      <Record />
    </button>
  )
}
