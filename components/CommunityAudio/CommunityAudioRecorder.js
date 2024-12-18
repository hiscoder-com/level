import AudioPreview from './AudioPreview'
import FontSizeSetting from './FontSizeSetting'
import PauseButton from './PauseButton'
import RecordButton from './RecordButton'
import SpeedSetting from './SpeedSetting'
import StopButton from './StopButton'
import { useAudioPreview } from './useAudio'

function CommunityAudioRecorder({
  isRecording = false,
  isPaused = false,
  audioUrl,
  audioName = '',
  loading = false,
  recordingMethods: { startRecording, stopRecording, pauseRecording, resumeRecording },
  textAdjustment: { fontSize = 16, setFontSize, textSpeed = 1, setTextSpeed },
}) {
  const { isPlaying, play, pause } = useAudioPreview(audioUrl || '')

  return (
    <div className="card flex w-full flex-col items-center justify-between gap-3 bg-th-secondary-10 !pb-4 sm:gap-7 md:flex-row">
      <div className="flex flex-col justify-between gap-4">
        <SpeedSetting textSpeed={textSpeed} setTextSpeed={setTextSpeed} />
        <FontSizeSetting fontSize={fontSize} setFontSize={setFontSize} />
      </div>
      <div className="flex items-center gap-1">
        <PauseButton
          isRecording={isRecording}
          onPause={pauseRecording}
          onResume={resumeRecording}
          isPaused={isPaused}
        />
        <RecordButton
          isRecording={isRecording}
          isPaused={isPaused}
          startRecording={startRecording}
          resumeRecording={resumeRecording}
        />
        <StopButton isRecording={isRecording} stopRecording={stopRecording} />
      </div>
      <div className="flex items-center">
        <AudioPreview
          loading={loading}
          audioName={audioName}
          audioUrl={audioUrl}
          onPlay={play}
          isPlaying={isPlaying}
          onPause={pause}
        />
      </div>
    </div>
  )
}

export default CommunityAudioRecorder
