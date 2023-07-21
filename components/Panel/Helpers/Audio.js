import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { useRecoilState } from 'recoil'

import Recorder from 'components/Recorder'

import { inactiveState } from '../state/atoms'

import BackButton from 'public/left-arrow.svg'

export default function Audio() {
  const [audioState, setAudioState] = useState('Main Audio')
  const [inactive, setInactive] = useRecoilState(inactiveState)

  return (
    <>
      {audioState === 'Retell Yourself' ? (
        <RetellYourself setAudioState={setAudioState} setInactive={setInactive} />
      ) : audioState === 'Retell Partner' ? (
        <RetellPartner
          setAudioState={setAudioState}
          inactive={inactive}
          setInactive={setInactive}
        />
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
      <button onClick={() => setAudioState('Retell Partner')} className="btn-cyan">
        {t('RetellPartner')}
      </button>
      <p>{t('Title')}</p>

      <button onClick={() => setAudioState('Retell Yourself')} className="btn-cyan">
        {t('RetellYourself')}
      </button>
    </div>
  )
}

function RetellPartner({ setAudioState, inactive, setInactive }) {
  const { t } = useTranslation(['audio'])
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
    <div className="flex flex-col items-center gap-5 min-h-full justify-center relative">
      <BackButtonComponent
        setAudioState={setAudioState}
        audioState={'Main Audio'}
        setInactive={setInactive}
        className="border-0 w-4 h-4 absolute top-0 left-0"
      />
      {inactive ? (
        <button className="btn-cyan mr-2" onClick={() => setInactive(false)}>
          {t('Finished')}
        </button>
      ) : (
        <>
          <p>{t('StartRetelling')}</p>
          <div className="flex">
            <button className="btn-cyan mr-2" onClick={() => setInactive(true)}>
              {t('InOriginalLanguage')}
            </button>
            <button className="btn-cyan" onClick={() => setInactive(true)}>
              {t('InTargetLanguage')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function RetellYourself({ setAudioState, setInactive }) {
  const { t } = useTranslation(['audio'])

  return (
    <>
      <BackButtonComponent
        setAudioState={setAudioState}
        audioState={'Main Audio Component'}
        setInactive={setInactive}
        className="border-0 w-4 h-4"
      />
      <div className="flex justify-center flex-wrap mt-8">
        <div className="w-full pb-4 px-2 mb-4 border-b-4">
          <p className="mb-4">{t('OriginalRecording')}</p>
          <Recorder />
        </div>
        <div className="w-full pb-4 px-2 mb-4 border-b-4">
          <p className="mb-4">{t('TargetRecording')}</p>
          <Recorder />
        </div>
      </div>
    </>
  )
}

function BackButtonComponent({ setAudioState, audioState, setInactive, className }) {
  return (
    <button
      onClick={() => {
        setAudioState(audioState)
        setInactive(false)
      }}
      className={className}
    >
      <BackButton className="stroke-cyan-700" />
    </button>
  )
}
