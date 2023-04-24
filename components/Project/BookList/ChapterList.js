import Link from 'next/link'
import { readableDate } from 'utils/helper'
import Plus from '/public/plus.svg'

import { useTranslation } from 'next-i18next'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import Download from './Download'
import BreadCrumb from 'components/ProjectEdit/BreadCrumb'
import ChapterCreate from './ChapterCreate'

import { useGetChapters, useGetCreatedChapters } from 'utils/hooks'

function ChapterList({ book, access: { isCoordinatorAccess }, project, user }) {
  const { query, push, isReady } = useRouter()
  const { t } = useTranslation()
  const [openDownloading, setOpenDownloading] = useState(false)
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
      setOpenDownloading(true)
    } else {
      setOpenDownloading(false)
    }
  }, [isReady, query])
  return (
    <>
      {openDownloading ? (
        <Download chapter={downloadingChapter} project={project} bookCode={book} />
      ) : (
        <div className="flex flex-col gap-7 w-full">
          <BreadCrumb
            links={[{ href: '/projects/' + project?.code, title: t('books:' + book) }]}
          />
          <div className="flex flex-col gap-3 h4">
            <div className="flex px-5 py-3 rounded-xl">
              <div className="w-1/6">{t('Chapter')}</div>
              <div className="w-2/6">
                {t('chapters:StartedAt')}/{t('chapters:FinishedAt')}
              </div>
              <div className="w-3/6">{`${t('Download')} / ${t('Open')}`}</div>
            </div>
            <div className="overflow-y-scroll flex flex-col gap-3 max-h-[80vh] pr-4">
              {chapters &&
                chapters.map((chapter) => {
                  const { id, started_at, finished_at, num } = chapter

                  return (
                    createdChapters?.includes(id) && (
                      <Link
                        key={id}
                        href={`/projects/${project?.code}/books/${book}/${num}`}
                      >
                        <div className="flex bg-blue-150 px-5 py-3 rounded-xl cursor-pointer">
                          <div className="w-1/6">{num}</div>
                          <div className="w-2/6">
                            {started_at && readableDate(started_at, query.locale)}
                            {finished_at && readableDate(finished_at, query.locale)}
                          </div>
                          <div
                            className="w-3/6"
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
                              // setOpenDownloading(true)
                            }}
                          >
                            {t('Download')}
                          </div>
                        </div>
                      </Link>
                    )
                  )
                })}

              {nextChapter && isCoordinatorAccess && (
                <>
                  <div
                    className="flex bg-blue-150 px-5 py-3 rounded-xl cursor-pointer hover:bg-blue-250 mr-4"
                    onClick={() => {
                      setCreatingChapter(nextChapter)
                    }}
                  >
                    <div className="w-1/6"></div>
                    <div className="w-2/6"></div>
                    <div className="w-3/6 flex items-center gap-2">
                      <div className="w-6">
                        <Plus />
                      </div>
                      <p>{t('AddChapter')}</p>
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
