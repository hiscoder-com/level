import Link from 'next/link'
import { readableDate } from 'utils/helper'
import { supabase } from 'utils/supabaseClient'
import Plus from '/public/plus.svg'
import LeftArrow from '/public/left-arrow.svg'
import { toast } from 'react-hot-toast'

import { useTranslation } from 'next-i18next'
import { useMemo } from 'react'
import { useRouter } from 'next/router'

function ChapterList({
  chapters,
  book,
  createdChapters,
  mutate: { mutateCreatedChapters, mutateChapters },
  access: { isCoordinatorAccess },
  project,
}) {
  const { query: locale, push } = useRouter()
  const { t } = useTranslation()

  const nextChapter = useMemo(() => {
    const num =
      chapters?.length - createdChapters?.length > 0 && createdChapters?.length + 1
    return chapters?.find((chapter) => chapter.num === num)
  }, [chapters, createdChapters?.length])

  const handleAddChapter = async ({ chapter_id, num }) => {
    try {
      const res = await supabase.rpc('create_verses', { chapter_id })
      if (res.data) {
        mutateChapters()
        mutateCreatedChapters()
        push('/projects/' + code + '/books/' + selectedBook.code + '/' + num)
      }
    } catch (error) {
      toast.error(t('CreateFailed'))
    }
  }

  return (
    <div className="flex flex-col gap-7 w-full">
      <Link href={`/projects/${project?.code}`}>
        <a className="flex items-center gap-3 cursor-pointer">
          <LeftArrow />
          <h3 className="h3 font-bold">{book}</h3>
        </a>
      </Link>
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
                  <Link key={id} href={`/projects/${project?.code}/books/${book}/${num}`}>
                    <div className="flex bg-blue-150 px-5 py-3 rounded-xl cursor-pointer">
                      <div className="w-1/6">{num}</div>
                      <div className="w-2/6">
                        {started_at && readableDate(started_at, locale)}
                        {finished_at && readableDate(finished_at, locale)}
                      </div>
                      <div className="w-3/6">{t('Download')}</div>
                    </div>
                  </Link>
                )
              )
            })}

          {nextChapter && isCoordinatorAccess && (
            <div
              className="flex bg-blue-150 px-5 py-3 rounded-xl cursor-pointer hover:bg-blue-250 mr-4"
              onClick={() =>
                handleAddChapter({ chapter_id: nextChapter.id, num: nextChapter.num })
              }
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
          )}
        </div>
      </div>
    </div>
  )
}

export default ChapterList
