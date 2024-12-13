import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import { useTranslation } from 'react-i18next'

import ParticipantInfo from 'components/Project/ParticipantInfo'

import BookListReader from './BookListReader'
import CommunityAudioRecorder from './CommunityAudioRecorder'
import Teleprompter from './Teleprompter'
import { useAudioRecorder } from './useAudio'

import { useCurrentUser } from 'lib/UserContext'

import { newTestamentList, oldTestamentList, usfmFileNames } from 'utils/config'
import { checkBookCodeExists, getVerseObjectsForBookAndChapter } from 'utils/helper'
import {
  useAccess,
  useGetBooks,
  useGetChaptersTranslate,
  useGetResource,
  useProject,
} from 'utils/hooks'

import Left from 'public/icons/left.svg'

function CommunityAudio() {
  const [fontSize, setFontSize] = useState(16)
  const [textSpeed, setTextSpeed] = useState(1)
  const { t } = useTranslation(['books'])
  const router = useRouter()
  const currentLang = router.locale

  const {
    isRecording,
    isPaused,
    audioUrl,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    loading,
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

  const audioName =
    reference &&
    `${t(`books:${reference.bookid}_abbr`)}_${reference.chapter}_${currentLang === 'ru' ? `${new Date().getDate()}${new Date().getMonth()}` : `${new Date().getMonth()}${new Date().getDate()}`}${new Date().getFullYear().toString().slice(2)}`

  return (
    <div className="mx-auto flex max-w-7xl flex-col-reverse gap-7 pb-10 xl:flex-row">
      <div className="static top-7 flex w-full flex-col gap-7 self-start md:flex-row xl:sticky xl:w-1/3 xl:flex-col">
        <div className="hidden md:w-1/2 xl:block xl:w-full">
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
      <div className="w-full space-y-7 xl:w-2/3">
        <CommunityAudioRecorder
          audioName={audioName}
          textAdjustment={{
            fontSize,
            setFontSize,
            textSpeed,
            setTextSpeed,
          }}
          isRecording={isRecording}
          isPaused={isPaused}
          audioUrl={audioUrl}
          loading={loading}
          recordingMethods={{
            startRecording,
            stopRecording,
            pauseRecording,
            resumeRecording,
          }}
        />
        <div className="card flex flex-col gap-7 overflow-hidden bg-th-secondary-10">
          <div className="flex flex-col items-start sm:flex-row sm:items-center sm:gap-12 xl:hidden">
            <Link href={'/projects/' + project?.code} className="p-3">
              <Left className="h-5 w-5 stroke-th-primary-200 hover:opacity-70" />
            </Link>
          </div>
          <Teleprompter
            textProperties={{
              fontSize,
              textSpeed,
            }}
            verseObjects={verseObjectsToUse}
            user={user}
            reference={reference}
            isLoading={isLoading}
            isRecording={isRecording}
            isPaused={isPaused}
            stopRecording={stopRecording}
          />
        </div>
      </div>
    </div>
  )
}

export default CommunityAudio
