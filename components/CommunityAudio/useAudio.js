import { useCallback, useEffect, useRef, useState } from 'react'

import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const mediaRecorder = useRef(null)
  const audioChunks = useRef([])
  const { t } = useTranslation(['audio'])

  const startRecording = useCallback(async () => {
    audioChunks.current = []

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.current = new MediaRecorder(stream)

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data)
      }

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/mpeg' })
        const audioUrl = URL.createObjectURL(audioBlob)
        setAudioUrl(audioUrl)
      }

      mediaRecorder.current.start()
      setIsRecording(true)
      setIsPaused(false)
    } catch (error) {
      toast.error(t('audio:TurnMicrophone'), { position: 'bottom-right' })
      console.error('Error accessing microphone:', error)
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop()
      setIsRecording(false)
      setIsPaused(false)
    }
  }, [])

  const pauseRecording = useCallback(() => {
    if (mediaRecorder.current) {
      mediaRecorder.current.pause()
      setIsPaused(true)
    }
  }, [])

  const resumeRecording = useCallback(() => {
    if (mediaRecorder.current) {
      mediaRecorder.current.resume()
      setIsPaused(false)
    }
  }, [])

  return {
    isRecording,
    isPaused,
    audioUrl,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  }
}

export function useAudioPreview(audioUrl) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      setPreview(audio)

      audio.addEventListener('ended', () => setIsPlaying(false))

      return () => audio.removeEventListener('ended', () => setIsPlaying(false))
    }
  }, [audioUrl])

  const play = useCallback(() => {
    if (preview) {
      preview.play()
      setIsPlaying(true)
    }
  }, [preview])

  const pause = useCallback(() => {
    if (preview) {
      preview.pause()
      setIsPlaying(false)
    }
  }, [preview])

  return { isPlaying, play, pause }
}
