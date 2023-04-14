import { useEffect, useState } from 'react'

import Link from 'next/link'

import { useTranslation } from 'next-i18next'

import Translators from './Translators'
import Placeholder from './Placeholder'

import { supabase } from 'utils/supabaseClient'
import { useBriefState } from 'utils/hooks'

function ProjectCard({ project, token, userId }) {
  const [highLevelAccess, setHighLevelAccess] = useState(false)

  const { t } = useTranslation(['projects', 'common', 'books'])

  const { briefResume, isLoading } = useBriefState({
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

  return (
    <>
      {!project?.code || isLoading || !userId ? (
        <Placeholder />
      ) : (
        <Link href={`/projects/${project.code}`}>
          <div className="card flex flex-col gap-9 h-full cursor-pointer">
            <div className="text-darkBlue text-2xl font-medium">{project.title}</div>
            <div className="flex flex-col gap-5 text-lg">
              <div className="flex gap-3">
                <p className="text-darkBlue">{t('Language')}:</p>
                <p className="text-teal-500">{project.languages.orig_name}</p>
              </div>
              <div className="flex gap-3">
                <p className="text-darkBlue">{t('Translators')}:</p>
                <Translators projectCode={project.code} size="25px" />
              </div>
            </div>
            {briefResume === '' && (
              <Link href={`/projects/${project?.code}/edit/brief`}>
                <a className="step-link w-fit">
                  {t(`common:${highLevelAccess ? 'EditBrief' : 'OpenBrief'}`)}
                </a>
              </Link>
            )}
          </div>
        </Link>
      )}
    </>
  )
}

export default ProjectCard
