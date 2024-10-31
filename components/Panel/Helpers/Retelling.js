import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'
import BackButton from 'public/arrow-left.svg'
import { useRecoilState, useSetRecoilState } from 'recoil'

import Recorder from 'components/Recorder'

import { inactiveState } from '../../state/atoms'

export default function Retelling({ config }) {
  const [audioState, setAudioState] = useState('Main')
  const setInactive = useSetRecoilState(inactiveState)
  const router = useRouter()
  // When isAlone true - user can retell in audio
  const isAlone = config?.config?.is_alone

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
      ) : audioState === 'Retell Partner' || !isAlone ? (
        <RetellPartner setAudioState={setAudioState} isYourselfRetelling={isAlone} />
      ) : (
        <Main setAudioState={setAudioState} />
      )}
    </>
  )
}

function Main({ setAudioState }) {
  const { t } = useTranslation(['audio'])
  const isIntranet = process.env.NEXT_PUBLIC_INTRANET ?? false
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-5">
      <button
        onClick={() => setAudioState('Retell Partner')}
        className="btn-base bg-th-secondary-300 text-th-text-secondary-100 hover:opacity-70"
      >
        {t('RetellPartner')}
      </button>
      {!isIntranet && (
        <>
          <p>{t('NoWayToTellPartner')}</p>
          <button
            onClick={() => setAudioState('Retell Yourself')}
            className="btn-base bg-th-secondary-300 text-th-text-secondary-100 hover:opacity-70"
          >
            {t('RetellYourself')}
          </button>
        </>
      )}
    </div>
  )
}

function RetellPartner({ setAudioState, isYourselfRetelling }) {
  const [inactive, setInactive] = useRecoilState(inactiveState)
  const { t } = useTranslation(['audio'])

  return (
    <div className="relative flex min-h-full flex-col items-center justify-center gap-5">
      {isYourselfRetelling && (
        <BackButtonComponent
          setAudioState={setAudioState}
          audioState={'Main Audio'}
          className="absolute left-0 top-0 h-5 w-5"
        />
      )}
      {inactive ? (
        <button
          className="btn-base mr-2 bg-th-secondary-300 text-th-text-secondary-100 hover:opacity-70"
          onClick={() => setInactive(false)}
        >
          {t('Finished')}
        </button>
      ) : (
        <>
          <p>{t('StartRetelling')}</p>
          <div className="flex">
            <button
              className="btn-base mr-2 bg-th-secondary-300 text-th-text-secondary-100 hover:opacity-70"
              onClick={() => setInactive(true)}
            >
              {t('InOriginalLanguage')}
            </button>
            <button
              className="btn-base bg-th-secondary-300 text-th-text-secondary-100 hover:opacity-70"
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
        className="left-0 top-0 h-5 w-5"
      />
      <div className="mt-8 flex flex-wrap justify-center">
        {['OriginalRecording', 'TargetRecording'].map((recorderType) => (
          <div
            key={recorderType}
            className="mb-4 w-full border-b-4 border-th-secondary-100 px-2 pb-4"
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
      <BackButton className="stroke-th-text-primary" />
    </button>
  )
}
