import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import BookListReader from './BookListReader'
import CommunityAudioRecorder from './CommunityAudioRecorder'
import ParticipantInfo from 'components/Project/ParticipantInfo'

import { useCurrentUser } from 'lib/UserContext'
import {
  useAccess,
  useGetBooks,
  useGetChaptersTranslate,
  useGetResource,
  useProject,
} from 'utils/hooks'

import { newTestamentList, oldTestamentList, usfmFileNames } from 'utils/config'
import { checkBookCodeExists, getVerseObjectsForBookAndChapter } from 'utils/helper'

import Left from '/public/left.svg'
import Teleprompter from './Teleprompter'

function CommunityAudio() {
  const [fontSize, setFontSize] = useState(16)
  const [textSpeed, setTextSpeed] = useState(1)

  const {
    isRecording,
    isPaused,
    audioUrl,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  } = useAudioRecorder()

  const { user } = useCurrentUser()
  const [reference, setReference] = useState()
  const {
    query: { code, bookid },
  } = useRouter()
  const [books] = useGetBooks({
    code,
  })
  const [project] = useProject({ code })
  const [{ isCoordinatorAccess }] = useAccess({
    user_id: user?.id,
    code: project?.code,
  })

  const [chapters] = useGetChaptersTranslate({ code })

  const resource = useMemo(() => {
    if (reference?.checks) {
      const resource = reference?.checks?.url?.split('/')
      return {
        owner: resource[3],
        repo: resource[4],
        commit: resource[6],
        bookPath:
          project?.type === 'obs' ? './content' : './' + usfmFileNames[reference?.bookid],
      }
    }
  }, [project?.type, reference?.bookid, reference?.checks])

  const { isLoading, data: verseObjects } = useGetResource({
    config: {
      reference: { book: reference?.bookid, chapter: reference?.chapter },
      resource: resource || { owner: '', repo: '', commit: '', bookPath: '' },
    },
    url: `/api/git/${project?.type}`,
  })

  const verseObjectsToUse =
    verseObjects ||
    getVerseObjectsForBookAndChapter(chapters, reference?.bookid, reference?.chapter)

  const createdNewTestamentBooks = useMemo(
    () =>
      books
        ? books
            .filter((book) =>
              Object.keys(newTestamentList).some(
                (nt) =>
                  nt === book.code &&
                  (book?.level_checks || checkBookCodeExists(book.code, chapters))
              )
            )
            .sort((a, b) => {
              return (
                Object.keys(newTestamentList).indexOf(a.code) -
                Object.keys(newTestamentList).indexOf(b.code)
              )
            })
        : [],
    [books, chapters]
  )

  const createdOldTestamentBooks = useMemo(
    () =>
      books
        ? books
            .filter((book) =>
              Object.keys(oldTestamentList).some(
                (ot) =>
                  ot === book.code &&
                  (book?.level_checks || checkBookCodeExists(book.code, chapters))
              )
            )
            .sort((a, b) => {
              return (
                Object.keys(oldTestamentList).indexOf(a.code) -
                Object.keys(oldTestamentList).indexOf(b.code)
              )
            })
        : [],

    [books, chapters]
  )

  useEffect(() => {
    if (bookid && books) {
      const book = books.find((book) => book.code === bookid)
      setReference((prev) => ({
        ...prev,
        chapter: 1,
        bookid,
        checks: book.level_checks,
      }))
    }
  }, [bookid, books])

  return (
    <div className="flex flex-col-reverse xl:flex-row gap-7 mx-auto max-w-7xl pb-10">
      <div className="static xl:sticky top-7 flex flex-col md:flex-row xl:flex-col gap-7 w-full xl:w-1/3 self-start">
        <div className="hidden xl:block md:w-1/2 xl:w-full">
          <BookListReader
            books={
              project?.type === 'obs'
                ? [books]
                : [createdOldTestamentBooks, createdNewTestamentBooks]
            }
            setReference={setReference}
            reference={reference}
            project={project}
          />
        </div>
        <div className="w-full">
          <ParticipantInfo project={project} access={isCoordinatorAccess} />
        </div>
      </div>
      <div className="w-full xl:w-2/3 space-y-7">
        <CommunityAudioRecorder
          textSettings={{ fontSize, setFontSize, textSpeed, setTextSpeed }}
          isRecording={isRecording}
          isPaused={isPaused}
          audioUrl={audioUrl}
          audioMethods={{
            startRecording,
            stopRecording,
            pauseRecording,
            resumeRecording,
          }}
        />
        <div className="card !p-0 flex flex-col gap-7 bg-th-secondary-10">
          <Teleprompter
            fontSize={fontSize}
            textSpeed={textSpeed}
            verseObjects={verseObjectsToUse}
            user={user}
            reference={reference}
            isLoading={isLoading}
            isRecording={isRecording}
            isPaused={isPaused}
          />
        </div>
      </div>
    </div>
  )
}

export default CommunityAudio

// ? Hooks
function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const mediaRecorder = useRef(null)
  const audioChunks = useRef([])

  const startRecording = useCallback(async () => {
    audioChunks.current = []
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.current = new MediaRecorder(stream)

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data)
      }

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' })
        const audioUrl = URL.createObjectURL(audioBlob)
        setAudioUrl(audioUrl)
      }

      mediaRecorder.current.start()
      setIsRecording(true)
      setIsPaused(false)
    } catch (error) {
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
