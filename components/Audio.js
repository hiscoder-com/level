import { useState } from 'react'
import Recorder from './Recorder'
import { useTranslation } from 'next-i18next'

export default function Audio() {
  const [item, setItem] = useState(true)

  return (
    <>{item ? <AudioList setItem={setItem} /> : <AudioRecorder setItem={setItem} />}</>
  )
}

function AudioList({ setItem }) {
  const { t } = useTranslation(['audio'])
  return (
    <>
      <div className="flex flex-col items-center gap-5 py-24 lg:py-56 h5">
        <p>{t('AudioTitle')}</p>
        <button
          onClick={() => {
            setItem(false)
          }}
          className="btn-cyan"
        >
          {t('AudioButton')}
        </button>
      </div>
    </>
  )
}

function AudioRecorder() {
  const { t } = useTranslation(['audio'])
  return (
    <div className="flex justify-center flex-wrap mt-8">
      <div className="pb-4 mb-4 border-b-4">
        <p className="mb-4">{t('OriginalRecording')}</p>
        <Recorder />
      </div>
      <div className="pb-4 mb-4 border-b-4">
        <p className="mb-4">{t('TargetRecording')}</p>
        <Recorder />
      </div>
    </div>
  )
}
