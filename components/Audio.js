import { useState } from 'react'

import { useTranslation } from 'next-i18next'

import Recorder from './Recorder'

export default function Audio() {
  const [isOpen, setIsOpen] = useState(true)

  return <>{isOpen ? <AudioList setIsOpen={setIsOpen} /> : <AudioRecorder />}</>
}

function AudioList({ setIsOpen }) {
  const { t } = useTranslation(['audio'])
  return (
    <div className="flex flex-col items-center gap-5 py-24 lg:py-56">
      <p>{t('AudioTitle')}</p>
      <div
        onClick={() => {
          setIsOpen(false)
        }}
        className="btn-cyan"
      >
        {t('AudioButton')}
      </div>
    </div>
  )
}

function AudioRecorder() {
  const { t } = useTranslation(['audio'])
  return (
    <div className="flex justify-center flex-wrap mt-8">
      <div className="w-full pb-4 px-2 mb-4 border-b-4">
        <p className="mb-4 px-4">{t('OriginalRecording')}</p>
        <Recorder />
      </div>
      <div className="w-full pb-4 px-2 mb-4 border-b-4">
        <p className="mb-4 px-4">{t('TargetRecording')}</p>
        <Recorder />
      </div>
    </div>
  )
}
