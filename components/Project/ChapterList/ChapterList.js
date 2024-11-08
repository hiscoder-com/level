import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import Breadcrumbs from 'components/Breadcrumbs'
import Modal from 'components/Modal'

import Download from '../Download'
import ChapterCreate from './ChapterCreate'

import { useCurrentUser } from 'lib/UserContext'

import { getBriefName, readableDate } from 'utils/helper'
import {
  useAccess,
  useBriefState,
  useGetChapters,
  useGetCreatedChapters,
  useProject,
} from 'utils/hooks'
import useSupabaseClient from 'utils/supabaseClient'

import Plus from 'public/icons/plus.svg'

function ChapterList() {
  const { user } = useCurrentUser()
  const supabase = useSupabaseClient()

  const {
    locale,
    query: { code, bookid },
    push,
  } = useRouter()
  const [{ isCoordinatorAccess, isModeratorAccess }] = useAccess({
    user_id: user?.id,
    code,
  })
  const { t } = useTranslation(['common', 'books'])
  const [isOpenDownloading, setIsOpenDownloading] = useState(false)
  const [creatingChapter, setCreatingChapter] = useState(false)
  const [downloadingChapter, setDownloadingChapter] = useState(null)
  const [currentSteps, setCurrentSteps] = useState([])
  const [project] = useProject({ code })
  const { briefResume, isBrief, briefName } = useBriefState({
    project_id: project?.id,
  })

  const [chapters, { mutate: mutateChapters }] = useGetChapters({
    code,
    book_code: bookid,
    revalidateIfStale: true,
  })

  const [createdChapters, { mutate: mutateCreatedChapters }] = useGetCreatedChapters({
    code,
    chapters: chapters?.map((el) => el.id),
  })

  useEffect(() => {
    if (!chapters?.length) {
      mutateChapters()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapters])

  useEffect(() => {
    if (project?.id) {
      supabase
        .rpc('get_current_steps', { project_id: project.id })
        .then((res) => setCurrentSteps(res.data))
    }
  }, [project?.id, supabase])
  const nameButtonBrief = useMemo(() => {
    return getBriefName(
      briefName,
      t(`${isCoordinatorAccess ? 'EditBrief' : 'OpenBrief'}`)
    )
  }, [briefName, isCoordinatorAccess, t])

  const getCurrentStep = (chapter) => {
    const step = currentSteps
      ?.filter((step) => step.book === bookid)
      ?.find((step) => step.chapter === chapter.num)
    if (step) {
      return (
        <>
          {!(!isBrief || briefResume) ? (
            <Link
              href={`/projects/${project?.code}/edit?setting=brief`}
              onClick={(e) => e.stopPropagation()}
            >
              {nameButtonBrief}
            </Link>
          ) : (
            <Link
              href={`/translate/${step.project}/${step.book}/${step.chapter}/${step.step}/intro`}
              onClick={(e) => e.stopPropagation()}
              className="w-fit text-sm hover:opacity-70 xl:text-lg"
            >
              {step.step} {t('Step').toLowerCase()}
            </Link>
          )}
        </>
      )
    }
  }
  return (
    <div className="pb-10">
      <div className="card mx-auto max-w-7xl bg-th-secondary-10">
        <div className="flex w-full flex-col gap-7">
          <Breadcrumbs
            links={[
              { title: project?.title, href: '/projects/' + code },
              { title: t('books:' + bookid) },
            ]}
          />
          <div className="flex flex-col gap-3 text-base">
            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
              {chapters &&
                chapters?.map((chapter) => {
                  const { id, num, started_at, finished_at } = chapter
                  const isCreated = createdChapters?.includes(id)
                  return (
                    <div
                      key={id}
                      className={`h-24 ${
                        !isCreated && isCoordinatorAccess ? 'verse-block' : ''
                      }`}
                      onClick={() =>
                        isCreated &&
                        isCoordinatorAccess &&
                        push({
                          pathname: `/projects/${project?.code}/books/${bookid}/${num}`,
                        })
                      }
                    >
                      <div
                        className={`flex h-24 flex-col justify-between rounded-2xl px-5 py-3 ${
                          isCoordinatorAccess ? 'cursor-pointer' : 'cursor-default'
                        } ${
                          finished_at
                            ? 'border-th-secondary-400 bg-th-secondary-400 text-th-text-secondary-100'
                            : isCreated
                              ? 'border-th-primary-100 bg-th-primary-100 text-th-text-secondary-100'
                              : 'border-th-primary-100 bg-th-secondary-10'
                        } border-2`}
                      >
                        <div className="flex justify-between">
                          <div className="text-xl font-bold">{num}</div>
                          <div>
                            {started_at && (
                              <div
                                className={`text-sm ${!finished_at ? 'opacity-70' : ''}`}
                              >
                                {readableDate(started_at, locale)}
                              </div>
                            )}
                            {finished_at && (
                              <div
                                className={`text-sm ${!finished_at ? 'opacity-70' : ''}`}
                              >
                                {readableDate(finished_at, locale)}
                              </div>
                            )}
                          </div>
                        </div>
                        {finished_at && isModeratorAccess ? (
                          <div
                            onClick={(e) => {
                              e.stopPropagation()
                              if (isModeratorAccess) {
                                setIsOpenDownloading(true)
                                setDownloadingChapter(chapter.num)
                              }
                            }}
                          >
                            <p className="text-sm hover:opacity-70 xl:text-lg">
                              {t('Download')}
                            </p>
                          </div>
                        ) : (
                          getCurrentStep(chapter)
                        )}
                      </div>
                      <div
                        className={`${
                          isCreated ? 'hidden' : 'hidden hover:block'
                        } h-full w-full cursor-pointer items-center justify-center rounded-2xl border-0 bg-th-primary-100 p-1 opacity-70`}
                        onClick={() => setCreatingChapter(chapter)}
                      >
                        <div className="h-10 w-10 rounded-full border-2 border-th-secondary-10 bg-th-secondary-10 p-2 text-th-text-primary shadow-md">
                          <Plus className="h-5 w-5" />
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
        {
          <Modal
            isOpen={isOpenDownloading}
            closeHandle={() => setIsOpenDownloading(false)}
            className={{
              dialogPanel:
                'w-full max-w-md overflow-y-visible rounded-3xl bg-th-primary-100 p-6 align-middle text-th-text-secondary-100',
            }}
          >
            <Download
              project={project}
              bookCode={bookid}
              chapterNum={downloadingChapter}
              setIsOpenDownloading={setIsOpenDownloading}
            />
          </Modal>
        }
      </div>
    </div>
  )
}

export default ChapterList
