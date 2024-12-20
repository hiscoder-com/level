import AudioPause from 'public/icons/audioPause.svg'
import AudioPlay from 'public/icons/audioPlay.svg'
import Download from 'public/icons/download-audio.svg'
import Loading from 'public/icons/progress.svg'

export default function AudioPreview({
  audioUrl,
  onPlay,
  onPause,
  isPlaying,
  audioName,
  loading,
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-full border border-th-text-primary p-2 ${
        !audioUrl || loading ? 'opacity-70' : ''
      }`}
    >
      <p className="text-sm">{audioName || 'audio'}</p>
      <a
        href={audioUrl || ''}
        className="disabled:fill-gray-400"
        download={`${audioName || 'audio'}.mp3`}
      >
        {loading && !audioUrl ? (
          <Loading className="progress-custom-colors h-5 w-5 animate-spin stroke-th-secondary-100" />
        ) : (
          <Download />
        )}
      </a>
      <button
        disabled={!audioUrl}
        className="rounded-full bg-th-secondary-400 p-2 disabled:bg-th-text-primary"
        onClick={isPlaying ? onPause : onPlay}
      >
        {loading ? (
          <Loading className="progress-custom-colors h-5 w-5 animate-spin stroke-th-secondary-100" />
        ) : isPlaying ? (
          <AudioPause className="h-5 w-5" />
        ) : (
          <AudioPlay className="h-5 w-5" />
        )}
      </button>
    </div>
  )
}
