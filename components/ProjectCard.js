import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'

import { useTranslation } from 'next-i18next'

import Translators from 'components/Translators'

import { supabase } from 'utils/supabaseClient'
import { useBrief } from 'utils/hooks'

function ProjectCard({ project, user }) {
  const { t } = useTranslation(['projects', 'common', 'books'])

  const [currentSteps, setCurrentSteps] = useState(null)
  const [isBriefFull, setIsBriefFull] = useState(false)
  const [brief, { mutate }] = useBrief({
    token: user?.access_token,
    project_id: project?.id,
  })
  useEffect(() => {
    if (brief?.data_collection) {
      setIsBriefFull(brief?.data_collection?.reduce((final, el) => final + el.resume, ''))
    }
  }, [brief])
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
  return (
    <div className="block p-6 h-full bg-white rounded-xl">
      <Link href={`/projects/${project.code}`}>
        <a className="block text-2xl mb-4 text-blue-450 underline decoration-2 underline-offset-4">
          {project.title}
        </a>
      </Link>
      <div className="flex gap-2.5 mb-1.5">
        <p className="text-gray-500">{t('Language')}:</p>
        <p>{project.languages.orig_name}</p>
      </div>
      <div className="flex gap-3">
        <p className="text-gray-500">{t('Translators')}:</p>
        <Translators projectCode={project.code} size="25px" />
      </div>
      {!isBriefFull && (
        <Link href={`/projects/${project?.code}/edit/brief`}>
          <a className="btn btn-white mt-2 mx-1 ">Заполните бриф</a>
        </Link>
      )}
      <div className="divide-y-2">
        {Object.entries(chapters).map((chapter, i) => {
          return (
            <div key={i} className="mb-2">
              <div>{t(`books:${chapter[0]}`)}</div>

              {chapter[1].map((step, index) =>
                isBriefFull ? (
                  <Link
                    key={index}
                    href={`/translate/${step.project}/${step.book}/${step.chapter}/${step.step}/intro`}
                  >
                    <a className="btn btn-white mt-2 mx-1 ">
                      {step.chapter} {t('common:Ch').toLowerCase()} | {step.step}{' '}
                      {t('common:Step').toLowerCase()}
                    </a>
                  </Link>
                ) : (
                  <div className={`btn  mt-2 mx-1 `}>
                    {step.chapter} {t('common:Ch').toLowerCase()} | {step.step}{' '}
                    {t('common:Step').toLowerCase()}
                  </div>
                )
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ProjectCard
