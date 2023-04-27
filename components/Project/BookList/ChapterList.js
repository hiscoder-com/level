import { useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import { useTranslation } from 'next-i18next'

import ChapterCreate from './ChapterCreate'
import Download from './Download'
import Breadcrumbs from 'components/Breadcrumbs'

import { useGetChapters, useGetCreatedChapters } from 'utils/hooks'

import Plus from '/public/plus.svg'
import { readableDate } from 'utils/helper'

function ChapterList({ book, access: { isCoordinatorAccess }, project, user }) {
  const { query, push } = useRouter()
  const { t } = useTranslation()
  const [isOpenDownloading, setIsOpenDownloading] = useState(false)
  const [creatingChapter, setCreatingChapter] = useState(false)
  const [chapters, { mutate: mutateChapters }] = useGetChapters({
    token: user?.access_token,
    code: project?.code,
    book_code: book,
  })

  const [createdChapters, { mutate: mutateCreatedChapters }] = useGetCreatedChapters({
    token: user?.access_token,
    code: project?.code,
    chapters: chapters?.map((el) => el.id),
  })

  useEffect(() => {
    if (!chapters?.length) {
      mutateChapters()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapters])

  useEffect(() => {
    if (query?.download && query?.code) {
      setIsOpenDownloading(true)
    } else {
      setIsOpenDownloading(false)
    }
  }, [query])
  return (
    <>
      {isOpenDownloading ? (
        <Download user={user} project={project} bookCode={book} />
      ) : (
        <div className="flex flex-col gap-7 w-full">
          <Breadcrumbs
            links={[
              { title: project?.title, href: '/projects/' + project?.code },
              { title: t('books:' + book) },
            ]}
          />
          <div className="flex flex-col gap-3 text-xl">
            <div className="w-full grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {chapters &&
                chapters?.map((chapter) => {
                  const { id, num, started_at, finished_at } = chapter
                  const isCreated = createdChapters?.includes(id)
                  return (
                    <div
                      key={id}
                      className={`${
                        !isCreated && isCoordinatorAccess ? 'verse-block ' : ''
                      } `}
                      onClick={() =>
                        isCreated &&
                        push({
                          pathname: `/projects/${project?.code}/books/${book}/${num}`,
                        })
                      }
                    >
                      <div
                        className={`flex flex-col justify-between px-5 py-3 h-24 rounded-2xl cursor-pointer ${
                          finished_at
                            ? 'bg-yellow-400'
                            : isCreated
                            ? 'text-white bg-darkBlue border-2 border-slate-900'
                            : 'bg-white border-2 border-slate-900'
                        }`}
                      >
                        <div className="flex items-end gap-4">
                          <div className="text-2xl font-bold">{num}</div>
                          {started_at && (
                            <div
                              className={`text-sm ${
                                !finished_at ? 'text-slate-400' : ''
                              }`}
                            >
                              {readableDate(started_at)}
                            </div>
                          )}
                        </div>
                        <div className="text-sm"></div>
                        {finished_at && (
                          <div
                            className="text-xl"
                            onClick={(e) => {
                              e.stopPropagation()
                              push({
                                pathname: `/projects/${project?.code}`,
                                query: {
                                  book,
                                  download: 'chapter',
                                  chapter: chapter?.num,
                                },
                                shallow: true,
                              })
                            }}
                          >
                            <p className="text-sm xl:text-xl">{t('Download')}</p>
                          </div>
                        )}
                      </div>
                      <div
                        className={`${
                          isCreated ? 'hidden' : ''
                        } flex w-full h-full rounded-2xl justify-center p-1 items-center border-0`}
                        style={{
                          background: 'linear-gradient(90deg, #B7C9E5 1%, #A5B5CE 98%)',
                        }}
                        onClick={() => setCreatingChapter(chapter)}
                      >
                        <div className="w-10 h-10 p-2 shadow-md text-slate-900 bg-white border-white border-2 rounded-full">
                          <Plus className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  )
                })}

              {isCoordinatorAccess && (
                <>
                  <ChapterCreate
                    setCreatingChapter={setCreatingChapter}
                    creatingChapter={creatingChapter}
                    mutate={{ mutateChapters, mutateCreatedChapters }}
                    project={project}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ChapterList
