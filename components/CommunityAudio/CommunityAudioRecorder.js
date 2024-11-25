import { useCallback, useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'

function CommunityAudioRecorder({
  isRecording,
  isPaused,
  audioUrl,
  audioName,
  recordingMethods: { startRecording, stopRecording, pauseRecording, resumeRecording },
  textAdjustment: { fontSize, setFontSize, textSpeed, setTextSpeed },
}) {
  const { isPlaying, play, pause } = useAudioPreview(audioUrl)

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

// ? Components

function SpeedSetting({ textSpeed, setTextSpeed }) {
  const [isMounted, setIsMounted] = useState(false)
  const { t } = useTranslation(['common'])

  const minSpeed = 1
  const maxSpeed = 15

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return (
    <div className="flex items-center gap-2 space-x-2">
      <div className="grid h-10 w-20 grid-cols-2 overflow-hidden rounded-full border border-th-primary-100">
        <button
          className="flex items-center justify-center border border-e-th-primary-100 disabled:opacity-70"
          onClick={() => setTextSpeed(textSpeed - 1)}
          disabled={textSpeed === minSpeed}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={5}
            stroke="currentColor"
            className="size-6 h-3 w-3"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
          </svg>
        </button>
        <button
          className="flex items-center justify-center disabled:opacity-70"
          onClick={() => setTextSpeed(textSpeed + 1)}
          disabled={textSpeed === maxSpeed}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={5}
            stroke="currentColor"
            className="size-6 h-3 w-3"
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
          <span className="font-semibold">
            {textSpeed < 10 ? `0${textSpeed}` : textSpeed}
          </span>{' '}
          {t('TextSpeed')}
        </p>
      </div>
    </div>
  )
}

function FontSizeSetting({ fontSize, setFontSize }) {
  const [isMounted, setIsMounted] = useState(false)

  const { t } = useTranslation(['common'])

  const minSize = 12
  const maxSize = 48

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return (
    <div className="flex items-center gap-2 space-x-2">
      <div className="grid h-10 w-20 grid-cols-2 overflow-hidden rounded-full border border-th-primary-100 font-bold">
        <button
          className="flex items-center justify-center border border-e-th-primary-100 text-xs disabled:opacity-70"
          onClick={() => setFontSize(fontSize - 1)}
          disabled={fontSize === minSize}
        >
          A
        </button>
        <button
          className="flex items-center justify-center disabled:opacity-70"
          onClick={() => setFontSize(fontSize + 1)}
          disabled={fontSize === maxSize}
        >
          A
        </button>
      </div>
      <div className="flex items-center text-sm">
        <p>
          <span className="font-semibold">{fontSize}</span> {t('FontSize')}
        </p>
      </div>
    </div>
  )
}

function AudioPreview({ audioUrl, onPlay, onPause, isPlaying, audioName }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-full border border-th-text-primary p-2 ${
        !audioUrl ? 'opacity-70' : ''
      }`}
    >
      <p className="text-sm">{audioName}</p>
      <a
        href={audioUrl}
        disabled={!audioUrl}
        className="disabled:fill-gray-400"
        download={`${audioName}.mp3`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-6 h-[18px] w-[18px]"
        >
          <path
            fillRule="evenodd"
            d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z"
            clipRule="evenodd"
          />
        </svg>
      </a>
      <button
        disabled={!audioUrl}
        className="rounded-full bg-th-secondary-400 p-2 disabled:bg-th-text-primary"
        onClick={isPlaying ? onPause : onPlay}
      >
        {isPlaying ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="#FFFFFF"
            className="size-6 h-5 w-5"
          >
            <path
              fillRule="evenodd"
              d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
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
        )}
      </button>
    </div>
  )
}

function PauseButton({ isPaused, isRecording, onPause, onResume }) {
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

function RecordButton({ isPaused, isRecording, startRecording, resumeRecording }) {
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
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="#FFFFFF"
        className="size-6 h-10 w-10"
      >
        <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
        <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
      </svg>
    </button>
  )
}

function StopButton({ isRecording, stopRecording }) {
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

// ? Hooks
function useAudioPreview(audioUrl) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      setPreview(audio)

      audio.addEventListener('ended', () => setIsPlaying(false))

      return () => audio.removeEventListener('ended', () => setIsPlaying(false))
    }
  }, [audioUrl])

  const play = useCallback(() => {
    if (preview) {
      preview.play()
      setIsPlaying(true)
    }
  }, [preview])

  const pause = useCallback(() => {
    if (preview) {
      preview.pause()
      setIsPlaying(false)
    }
  }, [preview])

  return { isPlaying, play, pause }
}
