import Link from 'next/link'

import { useTranslation } from 'next-i18next'

import Translators from './Translators'
import Placeholder from './Placeholder'

import { useBriefState, useAccess } from 'utils/hooks'

function ProjectCard({ project, user }) {
  const { t } = useTranslation(['projects', 'common'])
  const [{ isCoordinatorAccess }] = useAccess({
    user_id: user?.id,
    code: project?.code,
  })
  const { briefResume, isLoading } = useBriefState({
    project_id: project?.id,
  })

  return (
    <>
      {!project?.code || isLoading || !user?.id ? (
        <Placeholder />
      ) : (
        <Link
          href={{ pathname: '/projects/[code]', query: { code: project.code } }}
          legacyBehavior
        >
          <div className="card flex justify-between items-start h-min cursor-pointer">
            <div className="flex flex-col gap-9">
              <div className="text-xl font-bold">{project.title}</div>
              <div className="flex flex-col gap-5">
                <div className="flex gap-3">
                  <p>{t('Language')}:</p>
                  <p className="text-gray-400">{project.languages.orig_name}</p>
                </div>
                <div className="flex gap-3">
                  <p>{t('common:Translator_other')}:</p>
                  <Translators projectCode={project.code} size="25px" />
                </div>
              </div>
            </div>
            {briefResume === '' && (
              <Link
                href={{
                  pathname: '/projects/[code]/edit',
                  query: { code: project.code, setting: 'brief' },
                }}
                className="btn-primary w-fit"
              >
                {/* //TODO Ползёт кнопка на разных экранах */}
                {t(`common:${isCoordinatorAccess ? 'EditBrief' : 'OpenBrief'}`)}
              </Link>
            )}
          </div>
        </Link>
      )}
    </>
  )
}

export default ProjectCard
