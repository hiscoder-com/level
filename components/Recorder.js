import { useRef, useEffect, useState, useCallback } from 'react'
import RecorderButton from '../public/recorder.svg'
import StopButton from '../public/stop.svg'

export default function Recorder({ clear, setClear, setMicrophoneAccess }) {
  const audioRef = useRef(null)
  const [mediaRec, setMediaRec] = useState()
  const [voice, setVoice] = useState([])
  const [button, setButton] = useState(
    <RecorderButton className="stroke-cyan-700 stroke-2" />
  )
  const startStop = () => {
    if (mediaRec?.state === 'inactive') {
      setVoice([])
      mediaRec.start()
      setButton(<StopButton className="stroke-cyan-700 stroke-2" />)
    } else if (mediaRec?.state === 'recording') {
      mediaRec.stop()
      setButton(<RecorderButton className="stroke-cyan-700 stroke-2" />)
    } else {
      setMicrophoneAccess(true)
      alert('Доступ к микрофону отсутствует')
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
        console.error(`Вы не дали доступ к микрофону: ${err}`)
      })
  }, [])
  useEffect(() => {
    if (clear) {
      setClear(false)
      setVoice([])
    }
    if (voice) {
      const blobUrl = window.URL.createObjectURL(
        new Blob(voice, { type: 'audio/webm;codecs=opus' })
      )
      audioRef.current.src = blobUrl
    }
  }, [voice, clear, setClear])
  return (
    <div className="flex justify-center items-center">
      <audio className="mr-2" ref={audioRef} controls></audio>
      <button className="border-0 w-6 h-6" onClick={startStop}>
        {button}
      </button>
    </div>
  )
}
