import { useMemo } from 'react'

import Link from 'next/link'

import { useTranslation } from 'next-i18next'

import Placeholder from './Placeholder'
import Translators from './Translators'

import { getBriefName } from 'utils/helper'
import { useAccess, useBriefState } from 'utils/hooks'

function ProjectCard({ project, user }) {
  const { t } = useTranslation(['projects', 'common'])
  const [{ isCoordinatorAccess }] = useAccess({
    user_id: user?.id,
    code: project?.code,
  })
  const { briefResume, isLoading, briefName, isBrief } = useBriefState({
    project_id: project?.id,
  })
  const nameButtonBrief = useMemo(() => {
    return getBriefName(
      briefName,
      t(`common:${isCoordinatorAccess ? 'EditBrief' : 'OpenBrief'}`)
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [briefName, isCoordinatorAccess])
  return (
    <>
      {!project?.code || isLoading || !user?.id ? (
        <Placeholder />
      ) : (
        <Link href={`/projects/${project.code}`} legacyBehavior>
          <div className="card flex h-full cursor-pointer items-start justify-between bg-th-secondary-10 sm:bg-th-secondary-100">
            <div className="flex flex-col gap-9">
              <div className="text-xl font-bold">{project.title}</div>{' '}
              {briefResume === '' && isBrief && (
                <Link
                  href={`/projects/${project?.code}/edit?setting=brief`}
                  className="btn-primary w-fit"
                >
                  {nameButtonBrief}
                </Link>
              )}
              <div className="flex flex-col gap-5">
                <div className="flex gap-3">
                  <p>{t('Language')}:</p>
                  <p className="text-th-secondary-300">{project.languages.orig_name}</p>
                </div>
                <div
                  className="flex cursor-default gap-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p>{t('common:Translator_other')}:</p>
                  <Translators
                    projectCode={project.code}
                    size="25px"
                    className="-mx-0.5"
                  />
                </div>
              </div>
            </div>
          </div>
        </Link>
      )}
    </>
  )
}

export default ProjectCard
