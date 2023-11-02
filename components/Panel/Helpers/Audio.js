import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { useRecoilState, useSetRecoilState } from 'recoil'

import Recorder from 'components/Recorder'

import { inactiveState } from '../../state/atoms'

import BackButton from 'public/left-arrow.svg'

export default function Audio() {
  const [audioState, setAudioState] = useState('Main Audio')
  const setInactive = useSetRecoilState(inactiveState)
  const router = useRouter()

  useEffect(() => {
    const handleRouteChange = () => {
      setInactive(false)
    }
    router.events.on('routeChangeStart', handleRouteChange)

    return () => {
      router.events.off('routeChangeStart', handleRouteChange)
    }
  }, [router, setInactive])

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
    <div className="flex flex-col items-center gap-5 min-h-full justify-center">
      <button
        onClick={() => setAudioState('Retell Partner')}
        className="btn-base bg-th-btn-background-tertiary text-th-text-secondary"
      >
        {t('RetellPartner')}
      </button>
      <p>{t('NoWayToTellPartner')}</p>
      <button
        onClick={() => setAudioState('Retell Yourself')}
        className="btn-base bg-th-btn-background-tertiary text-th-text-secondary"
      >
        {t('RetellYourself')}
      </button>
    </div>
  )
}

function RetellPartner({ setAudioState }) {
  const [inactive, setInactive] = useRecoilState(inactiveState)
  const { t } = useTranslation(['audio'])

  return (
    <div className="flex flex-col items-center gap-5 min-h-full justify-center relative">
      <BackButtonComponent
        setAudioState={setAudioState}
        audioState={'Main Audio'}
        className="w-5 h-5 absolute top-0 left-0"
      />
      {inactive ? (
        <button
          className="btn-base bg-th-btn-background-tertiary text-th-text-secondary mr-2"
          onClick={() => setInactive(false)}
        >
          {t('Finished')}
        </button>
      ) : (
        <>
          <p>{t('StartRetelling')}</p>
          <div className="flex">
            <button
              className="btn-base bg-th-btn-background-tertiary text-th-text-secondary mr-2"
              onClick={() => setInactive(true)}
            >
              {t('InOriginalLanguage')}
            </button>
            <button
              className="btn-base bg-th-btn-background-tertiary text-th-text-secondary"
              onClick={() => setInactive(true)}
            >
              {t('InTargetLanguage')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function RetellYourself({ setAudioState }) {
  const { t } = useTranslation(['audio'])

  return (
    <>
      <BackButtonComponent
        setAudioState={setAudioState}
        audioState={'Main Audio Component'}
        className="w-5 h-5 top-0 left-0"
      />
      <div className="flex justify-center flex-wrap mt-8">
        {['OriginalRecording', 'TargetRecording'].map((recorderType) => (
          <div
            key={recorderType}
            className="w-full pb-4 px-2 mb-4 border-b-4 border-th-background-primary"
          >
            <p className="mb-4">{t(recorderType)}</p>
            <Recorder />
          </div>
        ))}
      </div>
    </>
  )
}

function BackButtonComponent({ setAudioState, audioState, className }) {
  const setInactive = useSetRecoilState(inactiveState)

  return (
    <button
      onClick={() => {
        setAudioState(audioState)
        setInactive(false)
      }}
      className={className}
    >
      <BackButton className="stroke-th-icons-primary" />
    </button>
  )
}
