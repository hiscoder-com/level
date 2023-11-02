import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import { useTranslation } from 'next-i18next'

import ChapterCreate from './ChapterCreate'
import Download from '../Download'
import Modal from 'components/Modal'
import Breadcrumbs from 'components/Breadcrumbs'

import {
  useAccess,
  useBriefState,
  useGetChapters,
  useGetCreatedChapters,
  useProject,
} from 'utils/hooks'
import useSupabaseClient from 'utils/supabaseClient'
import { readableDate } from 'utils/helper'

import { useCurrentUser } from 'lib/UserContext'

import Plus from 'public/plus.svg'

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
  const { briefResume, isBrief } = useBriefState({
    project_id: project?.id,
  })

  const [chapters, { mutate: mutateChapters }] = useGetChapters({
    code,
    book_code: bookid,
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
              {t(isCoordinatorAccess ? 'EditBrief' : 'OpenBrief')}
            </Link>
          ) : (
            <Link
              href={`/translate/${step.project}/${step.book}/${step.chapter}/${step.step}/intro`}
              onClick={(e) => e.stopPropagation()}
              className="text-sm xl:text-lg"
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
      <div className="card bg-th-background-secondary mx-auto max-w-7xl">
        <div className="flex flex-col gap-7 w-full">
          <Breadcrumbs
            links={[
              { title: project?.title, href: '/projects/' + code },
              { title: t('books:' + bookid) },
            ]}
          />
          <div className="flex flex-col gap-3 text-base">
            <div className="w-full grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
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
                        className={`flex flex-col justify-between px-5 py-3 h-24 rounded-2xl ${
                          isCoordinatorAccess ? 'cursor-pointer' : 'cursor-default'
                        } ${
                          finished_at
                            ? 'bg-th-secondary border-th-secondary text-th-text-secondary'
                            : isCreated
                            ? 'text-th-text-secondary bg-th-third-check border-th-third-check'
                            : 'bg-th-background-secondary border-th-third-check'
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
                            <p className="text-sm xl:text-lg">{t('Download')}</p>
                          </div>
                        ) : (
                          getCurrentStep(chapter)
                        )}
                      </div>
                      <div
                        className={`${
                          isCreated ? 'hidden' : 'hidden hover:block'
                        } justify-center items-center p-1 w-full h-full rounded-2xl border-0 cursor-pointer`}
                        style={{
                          background:
                            'linear-gradient(90deg, var(--hover-chapter-from) 1%, var(--hover-chapter-to) 98%)',
                        }}
                        onClick={() => setCreatingChapter(chapter)}
                      >
                        <div className="w-10 h-10 p-2 shadow-md text-th-text-primary bg-th-background-secondary border-th-background-secondary border-2 rounded-full">
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
        {
          <Modal
            isOpen={isOpenDownloading}
            closeHandle={() => setIsOpenDownloading(false)}
            className={{
              dialogPanel:
                'w-full max-w-md align-middle p-6 bg-gradient-to-r from-th-modal-from to-th-modal-to text-th-text-secondary overflow-y-visible rounded-3xl',
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
