import { useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import Verses from './Verses'
import BookListReader from './BookListReader'
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
import CommunityAudioRecorder from './CommunityAudioRecorder'

function CommunityAudio() {
  const [fontSize, setFontSize] = useState(16)

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
        <CommunityAudioRecorder fontSize={fontSize} setFontSize={setFontSize} />
        <div className="card flex flex-col gap-7 bg-th-secondary-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:gap-12 xl:hidden">
            <Link href={'/projects/' + project?.code} className="p-3">
              <Left className="w-5 h-5 stroke-th-primary-200 hover:opacity-70" />
            </Link>
          </div>
          <Verses
            fontSize={fontSize}
            verseObjects={verseObjectsToUse}
            user={user}
            reference={reference}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}

export default CommunityAudio
