import { useRef, useEffect, useState, Fragment } from 'react'

import { useTranslation } from 'next-i18next'

import { Dialog, Transition } from '@headlessui/react'

import { useRecoilState } from 'recoil'

import { inactiveState } from './Panel/state/atoms'

import RecorderButton from 'public/recorder.svg'
import StopButton from 'public/stop.svg'
import RecorderCrossedButton from 'public/error-outline.svg'
import TrashButton from 'public/trash.svg'

export default function Recorder() {
  const [, setInactive] = useRecoilState(inactiveState)
  const [showModal, setShowModal] = useState(false)
  const [mediaRec, setMediaRec] = useState()
  const [voice, setVoice] = useState([])
  const [button, setButton] = useState(
    <RecorderButton className="stroke-cyan-700 stroke-2" />
  )

  const audioRef = useRef(null)

  const startStop = () => {
    if (mediaRec?.state === 'inactive') {
      setVoice([])
      mediaRec.start()
      setButton(<StopButton className="stroke-cyan-700 stroke-2" />)
      setInactive(true)
    } else if (mediaRec?.state === 'recording') {
      mediaRec.stop()
      setButton(<RecorderButton className="stroke-cyan-700 stroke-2" />)
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
        setButton(<RecorderCrossedButton className="stroke-red-700 stroke-2" />)
        console.error(`You have not given access to the microphone: ${err}`)
      })
  }, [])

  useEffect(() => {
    if (voice.length > 0) {
      const blobUrl = window.URL.createObjectURL(
        new Blob(voice, { type: 'audio/webm;codecs=opus' })
      )
      audioRef.current.src = blobUrl
    } else if (audioRef.current) {
      audioRef.current.src = ''
    }
  }, [voice])

  return (
    <div className="flex justify-center items-center">
      <button className="border-0 w-6 h-6 mr-2" onClick={startStop}>
        {button}
      </button>
      <audio className="mr-2 w-full max-w-sm" ref={audioRef} controls></audio>
      <br />
      <button
        disabled={voice.length === 0}
        className="border-0 w-6 h-6"
        onClick={() => setVoice([])}
      >
        <TrashButton
          className={`stroke-2 ${
            voice.length > 0 ? 'stroke-cyan-700' : 'stroke-gray-300'
          }`}
        />
      </button>
      <Modal showModal={showModal} setShowModal={setShowModal} />
    </div>
  )
}

function Modal({ showModal, setShowModal }) {
  const { t } = useTranslation(['audio', 'common'])
  return (
    <Transition appear show={showModal} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => {
          setShowModal(false)
        }}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex items-center justify-center p-4 min-h-full text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="transform overflow-hidden p-6 w-full max-w-md align-middle bg-white rounded-2xl shadow-xl transition-all">
                <Dialog.Title as="h3" className="h3 font-medium leading-6">
                  {t('MicrophoneAccess')}
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{t('TurnMicrophone')}</p>
                </div>

                <div className="mt-4">
                  <button className="btn-cyan w-24" onClick={() => setShowModal(false)}>
                    {t('common:Ok')}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
