import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import Brief from './Brief/BriefBlock'
import ResourceSettings from './ResourceSettings'
import Participants from './Participants/Participants'
import Breadcrumbs from '../Breadcrumbs'

import { useAccess, useProject, useUsers } from 'utils/hooks'
import { useCurrentUser } from 'lib/UserContext'

function ProjectEdit() {
  const {
    query: { code },
  } = useRouter()
  const { t } = useTranslation()

  const { user } = useCurrentUser()

  const [users] = useUsers(user?.access_token)

  const [project] = useProject({ token: user?.access_token, code })
  const [{ isCoordinatorAccess, isModeratorAccess, isAdminAccess }] = useAccess({
    token: user?.access_token,
    user_id: user?.id,
    code: project?.code,
  })
  return (
    <div className="flex flex-col gap-7 mx-auto max-w-7xl">
      <Breadcrumbs
        links={[
          { title: project?.title, href: '/projects/' + code },
          { title: t('Settings') },
        ]}
        full
      />
      <div id="brief">
        <Brief access={isCoordinatorAccess} />
      </div>
      {isModeratorAccess && (
        <div id="participants">
          <Participants
            user={user}
            users={users}
            access={{ isCoordinatorAccess, isAdminAccess }}
          />
        </div>
      )}
      {isAdminAccess && (
        <div id="resources">
          <ResourceSettings />
        </div>
      )}
    </div>
  )
}

export default ProjectEdit
