import { useRef, useEffect, useState } from 'react'

import { useTranslation } from 'next-i18next'

import { useSetRecoilState } from 'recoil'

import { inactiveState } from './state/atoms'

import Modal from './Modal'

import RecorderButton from 'public/recorder.svg'
import StopButton from 'public/stop.svg'
import RecorderCrossedButton from 'public/error-outline.svg'
import TrashButton from 'public/trash.svg'
import PlayButton from 'public/play.svg'
import PauseButton from 'public/pause.svg'

export default function Recorder() {
  const { t } = useTranslation(['audio', 'common'])
  const setInactive = useSetRecoilState(inactiveState)
  const [showModal, setShowModal] = useState(false)
  const [mediaRec, setMediaRec] = useState()
  const [voice, setVoice] = useState([])
  const [buttonRecord, setButtonRecord] = useState(
    <RecorderButton className="stroke-th-text-primary stroke-2" />
  )
  const [buttonPlay, setButtonPlay] = useState(
    <PlayButton className="stroke-th-text-primary stroke-2" />
  )
  const audioRef = useRef(null)

  const startStop = () => {
    if (mediaRec?.state === 'inactive') {
      setVoice([])
      mediaRec.start()
      setButtonRecord(<StopButton className="stroke-th-text-primary stroke-2" />)
      setInactive(true)
    } else if (mediaRec?.state === 'recording') {
      mediaRec.stop()
      setButtonRecord(<RecorderButton className="stroke-th-text-primary stroke-2" />)
      setInactive(false)
    } else {
      setShowModal(true)
    }
  }

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorder.addEventListener('dataavailable', (event) => {
          setVoice((prev) => [...prev, event.data])
        })
        setMediaRec(mediaRecorder)
      })
      .catch((err) => {
        setButtonRecord(<RecorderCrossedButton className="stroke-th-invalid stroke-2" />)
        console.error(`You have not given access to the microphone: ${err}`)
      })
  }, [])

  useEffect(() => {
    if (voice.length > 0) {
      setButtonPlay(<PlayButton className="stroke-th-text-primary stroke-2" />)
      const blobUrl = window.URL.createObjectURL(
        new Blob(voice, { type: 'audio/webm;codecs=opus' })
      )
      audioRef.current.src = blobUrl
    } else if (audioRef.current) {
      setButtonPlay(<PlayButton className="stroke-th-secondary-300 stroke-2" />)
      audioRef.current.src = ''
    }
    audioRef.current.onended = () => {
      setButtonPlay(<PlayButton className="stroke-th-text-primary stroke-2" />)
    }
  }, [voice])

  const playPause = () => {
    if (audioRef.current.paused) {
      audioRef.current.play()
      setButtonPlay(<PauseButton className="stroke-th-text-primary stroke-2" />)
    } else {
      audioRef.current.pause()
      setButtonPlay(<PlayButton className="stroke-th-text-primary stroke-2" />)
    }
  }

  return (
    <div className="flex flex-row items-center gap-7">
      <button className="w-6 h-6" onClick={startStop}>
        {buttonRecord}
      </button>
      <audio ref={audioRef}></audio>
      <button className="w-6 h-6" disabled={!voice?.length} onClick={playPause}>
        {buttonPlay}
      </button>

      <button
        disabled={voice.length === 0}
        className="w-6 h-6"
        onClick={() => setVoice([])}
      >
        <TrashButton
          className={`stroke-2 ${
            voice.length > 0 ? 'stroke-th-text-primary' : 'stroke-th-secondary-300'
          }`}
        />
      </button>
      <Modal isOpen={showModal} closeHandle={() => setShowModal(false)}>
        <div className="flex flex-col gap-7">
          <div className="text-2xl text-center">{t('MicrophoneAccess')}</div>
          <p>{t('TurnMicrophone')}</p>
          <div className="flex justify-end">
            <button className="btn-secondary" onClick={() => setShowModal(false)}>
              {t('common:Ok')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
