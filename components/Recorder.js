import { useRef, useEffect, useState, useCallback } from 'react'
import RecorderButton from '../public/recorder.svg'
import PauseButton from '../public/pause.svg'
export default function Recorder({ clear, setClear }) {
  const audioRef = useRef(null)
  const [mediaRec, setMediaRec] = useState()
  const [voice, setVoice] = useState([])
  const [button, setButton] = useState(<RecorderButton className="audio-btn" />)

  const startStop = () => {
    if (mediaRec?.state === 'inactive') {
      mediaRec.start()
      setButton(<PauseButton className="audio-btn" />)
    } else if (mediaRec?.state === 'recording') {
      mediaRec.stop()
      setButton(<RecorderButton className="audio-btn" />)
    } else {
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
      <button className=" border-0 w-6 h-6" onClick={startStop}>
        {button}
      </button>
    </div>
  )
}
