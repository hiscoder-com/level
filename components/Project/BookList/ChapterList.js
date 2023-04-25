import { useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import { useTranslation } from 'next-i18next'

import ChapterCreate from './ChapterCreate'
import Download from './Download'
import DownloadIcon from '/public/download.svg'

import BreadCrumb from 'components/BreadCrumb'

import { readableDate } from 'utils/helper'
import { useGetChapters, useGetCreatedChapters } from 'utils/hooks'

import Plus from '/public/plus.svg'

function ChapterList({ book, access: { isCoordinatorAccess }, project, user }) {
  const { query, push, isReady } = useRouter()
  const { t } = useTranslation()
  const [isOpenDownloading, setIsOpenDownloading] = useState(false)
  const [downloadingChapter, setDownloadingChapter] = useState(null)
  const [creatingChapter, setCreatingChapter] = useState(false)
  const [chapters, { mutate: mutateChapters }] = useGetChapters({
    token: user?.access_token,
    code: project?.code,
    book_code: book,
  }) //TODO когда создаю новую книгу, то происходит редирект и chapters  - пустой массив до перезагрузки страницы

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
    if (query?.download && query?.code) {
      setIsOpenDownloading(true)
    } else {
      setIsOpenDownloading(false)
    }
  }, [isReady, query])
  return (
    <>
      {isOpenDownloading ? (
        <Download chapter={downloadingChapter} project={project} bookCode={book} />
      ) : (
        <div className="flex flex-col gap-7 w-full">
          <BreadCrumb
            links={[{ href: '/projects/' + project?.code, title: t('books:' + book) }]}
          />
          <div className="flex flex-col gap-3 h4">
            <div className="select-none grid gap-3 w-full grid-cols-1 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2">
              {chapters &&
                chapters.map((chapter) => {
                  const { id, started_at, finished_at, num } = chapter

                  return (
                    createdChapters?.includes(id) && (
                      <Link
                        key={id}
                        href={`/projects/${project?.code}/books/${book}/${num}`}
                      >
                        <div className="flex items-center justify-between px-5 py-3 bg-blue-150 hover:bg-blue-250 rounded-xl cursor-pointer">
                          <div className="basis-1/6">{num}</div>

                          <div
                            className="basis-3/6"
                            onClick={(e) => {
                              e.stopPropagation()
                              setDownloadingChapter(chapter)
                              push({
                                pathname: `/projects/${project?.code}`,
                                query: {
                                  book,
                                  download: 'chapter',
                                  code: chapter?.num,
                                },
                                shallow: true,
                              })
                            }}
                          >
                            <p className="block xl:hidden">{t('Download')}</p>

                            <div className="hidden xl:block w-6 h-6 min-h-6">
                              <DownloadIcon />
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
                    className="flex justify-center px-5 py-3 bg-blue-150 hover:bg-blue-250 rounded-xl cursor-pointer"
                    onClick={() => {
                      setCreatingChapter(nextChapter)
                    }}
                  >
                    <div className="w-6">
                      <Plus />
                    </div>
                    {/* <p>{t('AddChapter')}</p> */}
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
