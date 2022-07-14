import React, { useMemo, useState } from 'react'

import {
  useCoordinators,
  useAuthenticated,
  useModerators,
  usePermissions,
  useProject,
  useProjectRole,
  useTranslators,
  useUsers,
} from '@/utils/hooks'
import { useUser } from '../lib/UserContext'

import ProjectRolesList from './ProjectRolesList'

function ProjectEdit({ code }) {
  const [showSelectTranslator, setShowSelectTranslator] = useState(false)
  const { user, session } = useUser()
  const [users] = useUsers(session?.access_token)
  const [authenticated] = useAuthenticated({
    token: session?.access_token,
    id: user?.id,
  })

  const role = useProjectRole({
    token: session?.access_token,
    code,
    userId: user?.id,
    isAdmin: authenticated?.is_admin,
  })

  const [permissions] = usePermissions({ token: session?.access_token, role })
  const [project] = useProject({ token: session?.access_token, code })
  const [translators, { mutate }] = useTranslators({
    token: session?.access_token,
    code,
  })

  const [coordinators] = useCoordinators({
    token: session?.access_token,
    code,
  })
  const [moderators, { mutate: mutateModerator }] = useModerators({
    token: session?.access_token,
    code,
  })
  return (
    <div>
      <div className="text-3xl mb-10">{project?.title}</div>
      <div className="divide-y divide-gray-500 ">
        <ProjectRolesList
          moderators={moderators}
          session={session}
          code={code}
          mutate={mutate}
          project={project}
          users={users}
          type={'coordinators'}
          role={role}
          roles={translators}
          permissions={permissions}
          showSelectTranslator={showSelectTranslator}
          setShowSelectTranslator={setShowSelectTranslator}
        />
        <ProjectRolesList
          moderators={moderators}
          session={session}
          code={code}
          mutate={mutate}
          project={project}
          users={users}
          type={'translators'}
          role={role}
          roles={translators}
          permissions={permissions}
          showSelectTranslator={showSelectTranslator}
          setShowSelectTranslator={setShowSelectTranslator}
        />
      </div>
    </div>
  )
}

export default ProjectEdit
