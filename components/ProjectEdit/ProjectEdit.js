import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import Brief from './Brief/Brief'
import ResourceSettings from './ResourceSettings'
import Participants from './Participants/Participants'
import BreadCrumb from '../BreadCrumb'

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
    <div
      className="mx-auto max-w-7xl
    flex flex-col gap-7"
    >
      <BreadCrumb
        links={[
          { title: project?.title, href: '/projects/' + code },
          { title: t('Settings') },
        ]}
        full
      />
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
      <div id="brief">
        <Brief access={isCoordinatorAccess} />
      </div>
    </div>
  )
}

export default ProjectEdit
