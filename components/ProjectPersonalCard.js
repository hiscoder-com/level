import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import Translators from 'components/Translators'
import Placeholder from './Placeholder'

import { supabase } from 'utils/supabaseClient'
import { useBriefState, useGetBooks } from 'utils/hooks'
import { readableDate } from 'utils/helper'

function ProjectPersonalCard({ project, token, userId }) {
  const { locale } = useRouter()
  const [highLevelAccess, setHighLevelAccess] = useState(false)
  const [currentSteps, setCurrentSteps] = useState(null)

  const { t } = useTranslation(['projects', 'common', 'books'])

  const { briefResume, isBrief, isLoading } = useBriefState({
    token,
    project_id: project?.id,
  })

  useEffect(() => {
    const getLevel = async () => {
      const level = await supabase.rpc('authorize', {
        user_id: userId,
        project_id: project.id,
      })
      if (level?.data) {
        setHighLevelAccess(['admin', 'coordinator'].includes(level.data))
      }
    }
    if (userId && project?.id) {
      getLevel()
    }
  }, [userId, project?.id])

  useEffect(() => {
    supabase
      .rpc('get_current_steps', { project_id: project.id })
      .then((res) => setCurrentSteps(res.data))
  }, [project?.id])

  const chapters = useMemo(() => {
    const _chapters = {}
    currentSteps?.forEach((step) => {
      _chapters[step.book] = _chapters?.[step.book]?.length
        ? [..._chapters[step.book], step]
        : [step]
    })
    return _chapters
  }, [currentSteps])
  const localStorSteps = useMemo(
    () => JSON.parse(localStorage.getItem('viewedIntroSteps')),
    []
  )

  const searchLocalStorage = (step, localStorSteps) => {
    const { project, book, chapter, step: numStep } = step
    const isRepeatIntro = localStorSteps?.find(
      (el) =>
        JSON.stringify(el) ===
        JSON.stringify({
          project,
          book,
          chapter: chapter.toString(),
          step: numStep.toString(),
        })
    )
    return isRepeatIntro
  }
  const [books] = useGetBooks({
    token,
    code: project?.code,
  })
  const countChaptersVerses = useMemo(() => {
    if (books) {
      const count = {}
      for (const book of books) {
        let { chapters } = book
        if (book.code === 'obs') {
          const obsChapters = {}
          for (const key in chapters) {
            if (Object.hasOwnProperty.call(chapters, key)) {
              obsChapters[parseInt(key)] = chapters[key]
            }
          }
          chapters = obsChapters
        }
        const countVerses = Object.keys(chapters).reduce(
          (count, chapter) => count + chapters[chapter],
          0
        )
        count[book.code] = {
          countChapters: Object.keys(chapters).length,
          countVerses,
          chapters,
        }
      }
      return count
    }
  }, [books])

  return (
    <>
      {!project?.code || !chapters || !currentSteps || isLoading || !userId ? (
        <Placeholder />
      ) : (
        <div className="flex flex-col gap-7">
          {Object.keys(chapters).map((book, i) => {
            return (
              <>
                <div
                  key={i}
                  className="flex flex-col sm:flex-row p-7 mb-2 h-full gap-9 bg-white rounded-xl border border-[#bcbcbc] shadow-md"
                >
                  <div className="flex flex-col gap-9">
                    <div className="flex gap-1">
                      <div className="self-center text-darkBlue text-2xl font-medium ">
                        {t(`books:${book}`)}
                      </div>
                      <div className="pt-1 self-center">{`(${
                        countChaptersVerses?.[book].countChapters
                      } ${t('Chapters')} ${countChaptersVerses?.[book].countVerses} ${t(
                        'Verses'
                      )})`}</div>
                    </div>
                    <div className="flex flex-col gap-5 text-lg">
                      <div className="flex gap-3">
                        <p className="text-darkBlue">{t('Project')}:</p>
                        <Link href={`/projects/${project.code}`}>
                          <a>
                            <p className="text-teal-500">{project?.title}</p>
                          </a>
                        </Link>
                      </div>
                      <div className="flex gap-3">
                        <p className="text-darkBlue">{t('Translators')}:</p>
                        <Translators projectCode={project.code} size="25px" />
                      </div>
                      <div className="flex gap-3">
                        <p className="text-darkBlue">
                          {t('Begin')}:{' '}
                          {chapters &&
                            readableDate(
                              Math.min(
                                ...chapters?.[book].map((el) => Date.parse(el.started_at))
                              ),
                              locale
                            )}
                        </p>
                        <p className="text-teal-500"></p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap content-start">
                    {chapters[book].map((step, index) => {
                      const stepLink = (
                        <>
                          <span>
                            {step.chapter} {t('common:Ch').toLowerCase()}
                          </span>
                          <span>|</span>
                          <span>
                            {countChaptersVerses?.[book].chapters[step.chapter]}{' '}
                            {t('common:Ver').toLowerCase()}
                          </span>{' '}
                          <span>|</span>
                          <span>
                            {step.step} {t('common:Step').toLowerCase()}
                          </span>
                        </>
                      )

                      return !isBrief || briefResume ? (
                        <Link
                          key={index}
                          href={`/translate/${step.project}/${step.book}/${
                            step.chapter
                          }/${step.step}${
                            typeof searchLocalStorage(step, localStorSteps) ===
                            'undefined'
                              ? '/intro'
                              : ''
                          }`}
                        >
                          <a className="flex gap-2 py-3 px-4 mt-2 mx-1 h-min text-darkBlue border border-darkBlue rounded-3xl hover:bg-[#b7c9e5]">
                            {stepLink}
                          </a>
                        </Link>
                      ) : (
                        <div
                          key={index}
                          className="flex gap-2 p-3 h-min mt-2 mx-1 text-center text-gray-300 border cursor-not-allowed rounded-3xl"
                        >
                          {stepLink}
                        </div>
                      )
                    })}
                    {briefResume === '' && (
                      <Link href={`/projects/${project?.code}/edit/brief`}>
                        <a className="h-min p-3 mt-2 mx-1 text-darkBlue border border-darkBlue rounded-3xl hover:bg-[#b7c9e5]">
                          {t(`common:${highLevelAccess ? 'EditBrief' : 'OpenBrief'}`)}
                        </a>
                      </Link>
                    )}
                  </div>
                </div>
              </>
            )
          })}
        </div>
      )}
    </>
  )
}

export default ProjectPersonalCard
