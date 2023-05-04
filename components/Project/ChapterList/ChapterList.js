import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import ChapterCreate from './ChapterCreate'
import Download from '../Download'
import Breadcrumbs from 'components/Breadcrumbs'

import { useAccess, useGetChapters, useGetCreatedChapters, useProject } from 'utils/hooks'

import Plus from '/public/plus.svg'
import { readableDate } from 'utils/helper'
import { useCurrentUser } from 'lib/UserContext'

function ChapterList() {
  const { user } = useCurrentUser()

  const {
    query: { code, bookid },
    push,
  } = useRouter()
  const [{ isCoordinatorAccess, isModeratorAccess, isAdminAccess }] = useAccess({
    token: user?.access_token,
    user_id: user?.id,
    code,
  })
  const { t } = useTranslation()
  const [isOpenDownloading, setIsOpenDownloading] = useState(false)
  const [creatingChapter, setCreatingChapter] = useState(false)
  const [project] = useProject({ token: user?.access_token, code })

  const [chapters, { mutate: mutateChapters }] = useGetChapters({
    token: user?.access_token,
    code,
    book_code: bookid,
  })

  const [createdChapters, { mutate: mutateCreatedChapters }] = useGetCreatedChapters({
    token: user?.access_token,
    code,
    chapters: chapters?.map((el) => el.id),
  })

  useEffect(() => {
    if (!chapters?.length) {
      mutateChapters()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapters])

  // useEffect(() => {
  //   if (query?.download && query?.code) {
  //     setIsOpenDownloading(true)
  //   } else {
  //     setIsOpenDownloading(false)
  //   }
  // }, [query])
  return (
    <div className="pb-10">
      <div className="card mx-auto max-w-7xl">
        {isOpenDownloading ? (
          <Download user={user} project={project} bookCode={bookid} />
        ) : (
          <div className="flex flex-col gap-7 w-full">
            <Breadcrumbs
              links={[
                { title: project?.title, href: '/projects/' + code },
                { title: t('books:' + bookid) },
              ]}
            />
            <div className="flex flex-col gap-3 text-xl">
              <div className="w-full grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
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
                            pathname: `/projects/${project?.code}/books/${bookid}/${num}`,
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
                                    bookid,
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
      </div>
    </div>
  )
}

export default ChapterList
