import { useEffect, useState } from 'react'

import Link from 'next/link'

import { useTranslation } from 'next-i18next'

import Translators from 'components/Translators'

import { useCurrentUser } from 'lib/UserContext'
import { supabase } from 'utils/supabaseClient'

function ProjectCard({ project }) {
  const { t } = useTranslation(['projects', 'common', 'books'])

  const { user } = useCurrentUser()

  const [currentSteps, setCurrentSteps] = useState(null)

  useEffect(() => {
    supabase
      .rpc('get_current_steps', { project_id: project.id })
      .then((res) => setCurrentSteps(res.data))
  }, [project?.id])

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
      {/* <div className="flex gap-2.5 mb-1.5">
        <p className="text-gray-500">{t('common:Progress')}:</p>
        <p>10%</p>
      </div> */}
      <div className="flex gap-3">
        <p className="text-gray-500">{t('Translators')}:</p>
        <Translators projectCode={project.code} size="25px" />
      </div>
      {currentSteps?.length
        ? currentSteps.map((el, index) => (
            <Link
              key={index}
              href={`/translate/${el.project}/${el.book}/${el.chapter}/${el.step}/intro`}
            >
              <a className="btn btn-white mt-2 text-ellipsis overflow-hidden whitespace-nowrap max-w-full">
                {t(`books:${el.book}_abbr`)}.{el.chapter} | {el.title}
              </a>
            </Link>
          ))
        : ''}
    </div>
  )
}

export default ProjectCard
