import Link from 'next/link'

import { useTranslation } from 'next-i18next'

import ProjectPersonalCard from 'components/ProjectPersonalCard'

import { useProjects } from 'utils/hooks'
import { useCurrentUser } from 'lib/UserContext'

export default function PersonalList() {
  const { user } = useCurrentUser()
  const { t } = useTranslation(['projects'])

  const [projects] = useProjects({
    token: user?.access_token,
  })

  return (
    <div className="flex flex-col gap-7 py-10">
      {projects &&
        projects.map((project) => {
          return (
            <ProjectPersonalCard
              key={project.id}
              project={project}
              token={user?.access_token}
              userId={user?.id}
            />
          )
        })}

      {user?.is_admin && (
        <div className="pb-5 mt-3">
          <Link href={'/projects/create'}>
            <a className="btn-cyan">{t('AddNew')}</a>
          </Link>
        </div>
      )}
    </div>
  )
}
