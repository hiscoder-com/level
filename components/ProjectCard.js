import Link from 'next/link'

import { useTranslation } from 'next-i18next'

import Translators from './Translators'
import Placeholder from './Placeholder'

import { useBriefState, useAccess } from 'utils/hooks'

function ProjectCard({ project, token, user }) {
  const { t } = useTranslation(['projects', 'common', 'books'])
  const [{ isCoordinatorAccess }] = useAccess({
    token: user?.access_token,
    user_id: user?.id,
    code: project?.code,
  })
  const { briefResume, isLoading } = useBriefState({
    token,
    project_id: project?.id,
  })

  return (
    <>
      {!project?.code || isLoading || !user?.id ? (
        <Placeholder />
      ) : (
        <Link href={`/projects/${project.code}`}>
          <div className="card flex justify-between items-start h-full cursor-pointer">
            <div className="flex flex-col gap-9">
              <div className="h3 font-bold">{project.title}</div>
              <div className="flex flex-col gap-5">
                <div className="flex gap-3">
                  <p className="h4-5">{t('Language')}:</p>
                  <p className="text-lg text-teal-500">{project.languages.orig_name}</p>
                </div>
                <div className="flex gap-3">
                  <p className="h4-5">{t('Translators')}:</p>
                  <Translators projectCode={project.code} size="25px" />
                </div>
              </div>
            </div>
            {briefResume === '' && (
              <Link href={`/projects/${project?.code}/edit/brief`}>
                <a className="btn-link w-fit">
                  {t(`common:${isCoordinatorAccess ? 'EditBrief' : 'OpenBrief'}`)}
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
