import {
  useCoordinators,
  useModerators,
  usePermissions,
  useProject,
  useProjectRole,
  useTranslators,
  useUsers,
} from '@/utils/hooks'
import ProjectRolesList from './ProjectRolesList'
import { useCurrentUser } from '../lib/UserContext'

function ProjectEdit({ code }) {
  const { user } = useCurrentUser()
  const [users] = useUsers(user?.access_token)

  const role = useProjectRole({
    token: user?.access_token,
    code,
    userId: user?.id,
    isAdmin: user?.is_admin,
  })

  const [permissions] = usePermissions({ token: user?.access_token, role })
  const [project] = useProject({ token: user?.access_token, code })
  const [translators, { mutate: mutateTranslator }] = useTranslators({
    token: user?.access_token,
    code,
  })

  const [coordinators, { mutate: mutateCoordinator }] = useCoordinators({
    token: user?.access_token,
    code,
  })
  const [moderators, { mutate: mutateModerator }] = useModerators({
    token: user?.access_token,
    code,
  })
  return (
    <div>
      <div className="text-3xl mb-10">{project?.title}</div>
      <div className="divide-y divide-gray-500 ">
        <ProjectRolesList
          moderators={moderators}
          user={user}
          code={code}
          mutate={mutateCoordinator}
          project={project}
          users={users}
          type={'coordinators'}
          role={role}
          roles={coordinators}
          permissions={permissions}
        />
        <ProjectRolesList
          moderators={moderators}
          user={user}
          code={code}
          mutate={mutateTranslator}
          mutateModerator={mutateModerator}
          project={project}
          users={users}
          type={'translators'}
          role={role}
          roles={translators}
          permissions={permissions}
        />
      </div>
    </div>
  )
}

export default ProjectEdit
