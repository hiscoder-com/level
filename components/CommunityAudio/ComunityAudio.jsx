import { useEffect, useMemo, useState } from 'react'

import { useCurrentUser } from 'lib/UserContext'
import { useAccess, useGetBooks, useGetChaptersTranslate, useProject } from 'utils/hooks'

import ParticipantInfo from 'components/Project/ParticipantInfo'
import { BookListReader } from 'components/Project/BookReader'
import { newTestamentList, oldTestamentList } from 'utils/config'
import { checkBookCodeExists } from 'utils/helper'

function CommunityAudio({ code, bookid }) {
  const [reference, setReference] = useState()

  const { user } = useCurrentUser()

  const [project] = useProject({ code })

  const [{ isCoordinatorAccess, isModeratorAccess, isAdminAccess }, { isLoading }] =
    useAccess({
      user_id: user?.id,
      code: project?.code,
    })

  const [chapters] = useGetChaptersTranslate({ code })

  const [books] = useGetBooks({
    code,
  })

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
      setReference((prev) => ({ ...prev, chapter: 1, bookid, checks: book.level_checks }))
    }
  }, [bookid, books])

  return (
    <div className="flex flex-col-reverse xl:flex-row gap-7 mx-auto max-w-7xl pb-10">
      <div className="static xl:sticky top-7 flex flex-col sm:flex-row xl:flex-col gap-7 w-full xl:w-1/3 self-start">
        <ParticipantInfo project={project} access={isCoordinatorAccess} />
        <BookListReader
          project={project}
          books={
            project?.type === 'obs'
              ? [books]
              : [createdOldTestamentBooks, createdNewTestamentBooks]
          }
        />
      </div>
    </div>
  )
}

export default CommunityAudio
