import { useCallback, useEffect, useRef, useState } from 'react'

import { Mp3Encoder } from 'lamejs'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

export function useAudioRecorder(bitrate = 128) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const [loading, setLoading] = useState(false)

  const mediaRecorder = useRef(null)
  const audioChunks = useRef([])

  const { t } = useTranslation(['audio'])

  const encodeToMp3 = useCallback(
    async (chunks) => {
      try {
        const samplesAmount = 1152
        const maxPosValue = 32767
        const audioBlob = new Blob(chunks, { type: 'audio/webm' })
        const arrayBuffer = await audioBlob.arrayBuffer()

        const audioContext = new AudioContext()
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

        const mp3Data = []
        const encoder = new Mp3Encoder(1, audioBuffer.sampleRate, bitrate)

        const samples = audioBuffer.getChannelData(0)
        const buffer = new Int16Array(samples.length)

        for (let i = 0; i < samples.length; i++) {
          buffer[i] = samples[i] * maxPosValue
        }

        let sampleIndex = 0
        while (sampleIndex < buffer.length) {
          const sampleChunk = buffer.subarray(sampleIndex, sampleIndex + samplesAmount)
          const mp3Chunk = encoder.encodeBuffer(sampleChunk)
          if (mp3Chunk.length > 0) mp3Data.push(new Uint8Array(mp3Chunk))
          sampleIndex += samplesAmount
        }

        const mp3Final = encoder.flush()
        if (mp3Final.length > 0) mp3Data.push(new Uint8Array(mp3Final))

        const mp3Blob = new Blob(mp3Data, { type: 'audio/mp3' })
        return URL.createObjectURL(mp3Blob)
      } catch (error) {
        console.error('Error encoding MP3:', error)
        toast.error(t('audio:EncodingError'), { position: 'bottom-right' })
        return null
      }
    },
    [t, bitrate]
  )

  const startRecording = useCallback(async () => {
    audioChunks.current = []

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.current = new MediaRecorder(stream)

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data)
      }

      mediaRecorder.current.onstop = async () => {
        const mp3Url = await encodeToMp3(audioChunks.current)
        setAudioUrl(mp3Url)
      }

      mediaRecorder.current.start()
      setIsRecording(true)
      setIsPaused(false)
    } catch (error) {
      toast.error(t('audio:TurnMicrophone'), { position: 'bottom-right' })
      console.error('Error accessing microphone:', error)
    }
  }, [t, encodeToMp3])

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      setLoading(true)
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

  useEffect(() => {
    if (audioUrl) setLoading(false)
  }, [audioUrl])

  return {
    isRecording,
    isPaused,
    audioUrl,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    loading,
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
