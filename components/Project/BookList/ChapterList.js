import { useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import { useTranslation } from 'next-i18next'

import ChapterCreate from './ChapterCreate'
import Download from './Download'
import BreadCrumb from 'components/BreadCrumb'

import { useGetChapters, useGetCreatedChapters } from 'utils/hooks'

import DownloadIcon from '/public/download.svg'
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

  const nextChapter = useMemo(() => {
    const num =
      chapters?.length - createdChapters?.length > 0 && createdChapters?.length + 1
    return chapters?.find((chapter) => chapter.num === num)
  }, [chapters, createdChapters?.length])

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
          <BreadCrumb
            links={[
              { title: project?.title, href: '/projects/' + project?.code },
              { title: t('books:' + book) },
            ]}
          />
          <div className="flex flex-col gap-3 text-xl">
            <div className="select-none grid gap-3 w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {chapters &&
                chapters?.map((chapter) => {
                  const { id, num, started_at } = chapter

                  return (
                    createdChapters?.includes(id) && (
                      <Link
                        key={id}
                        href={`/projects/${project?.code}/books/${book}/${num}`}
                      >
                        <div className="flex items-center justify-between px-5 py-3 min-h-[5rem] bg-blue-150 rounded-xl cursor-pointer hover:bg-blue-250">
                          <div className="basis-1/6">{num}</div>
                          <div>
                            {started_at && <div>{readableDate(started_at)}</div>}
                            <div
                              className="basis-3/6"
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
                              <p className="block xl:hidden">{t('Download')}</p>
                              <div className="hidden xl:block w-6 h-6 min-h-[1.5rem]">
                                <DownloadIcon />
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  )
                })}

              {nextChapter && isCoordinatorAccess && (
                <>
                  <div
                    className="flex justify-center px-5 py-3 bg-blue-150 rounded-xl cursor-pointer hover:bg-blue-250"
                    onClick={() => setCreatingChapter(nextChapter)}
                  >
                    <div className="w-6">
                      <Plus />
                    </div>
                  </div>

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
