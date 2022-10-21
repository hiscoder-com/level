import { useState } from 'react'

import { useTranslation } from 'next-i18next'

import Recorder from 'components/Recorder'

import BackButton from 'public/back-button.svg'

export default function Audio() {
  const [audioState, setAudioState] = useState('Main Audio')

  return (
    <>
      {audioState === 'Retell Yourself' ? (
        <RetellYourself setAudioState={setAudioState} />
      ) : audioState === 'Retell Partner' ? (
        <RetellPartner setAudioState={setAudioState} />
      ) : (
        <MainAudio setAudioState={setAudioState} />
      )}
    </>
  )
}

function MainAudio({ setAudioState }) {
  const { t } = useTranslation(['audio'])
  return (
    <div className="flex flex-col items-center gap-5 py-24 lg:py-56">
      <button
        onClick={() => {
          setAudioState('Retell Partner')
        }}
        className="btn-cyan"
      >
        {t('RetellPartner')}
      </button>
      <p>{t('Title')}</p>

      <button
        onClick={() => {
          setAudioState('Retell Yourself')
        }}
        className="btn-cyan"
      >
        {t('RetellYourself')}
      </button>
    </div>
  )
}

function RetellPartner({ setAudioState }) {
  const { t } = useTranslation(['audio'])
  return (
    <>
      <button
        onClick={() => {
          setAudioState('Main Audio')
        }}
        className="border-0 w-4 h-4"
      >
        <BackButton className="stroke-cyan-700" />
      </button>
      <div className="flex flex-col items-center gap-5 py-24 lg:py-56">
        <p>{t('StartRetelling')}</p>
        <div className="flex">
          <button className="btn-cyan mr-2">{t('InOriginalLanguage')}</button>
          <button className="btn-cyan">{t('InTargetLanguage')}</button>
        </div>
      </div>
    </>
  )
}

function RetellYourself({ setAudioState }) {
  const { t } = useTranslation(['audio'])
  return (
    <>
      <button
        onClick={() => {
          setAudioState('Main Audio Component')
        }}
        className="border-0 w-4 h-4"
      >
        <BackButton className="stroke-cyan-700" />
      </button>
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
    </>
  )
}
