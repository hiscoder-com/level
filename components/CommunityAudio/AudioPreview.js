import AudioPause from 'public/icons/audioPause.svg'
import AudioPlay from 'public/icons/audioPlay.svg'

export default function AudioPreview({
  audioUrl,
  onPlay,
  onPause,
  isPlaying,
  audioName,
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-full border border-th-text-primary p-2 ${
        !audioUrl ? 'opacity-70' : ''
      }`}
    >
      <p className="text-sm">{audioName}</p>
      <a href={audioUrl} className="disabled:fill-gray-400" download={`${audioName}.mp3`}>
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
          <AudioPause className="h-5 w-5" />
        ) : (
          <AudioPlay className="h-5 w-5" />
        )}
      </button>
    </div>
  )
}
