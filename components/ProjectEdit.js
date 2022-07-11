import React from 'react'

import {
  useCoordinators,
  useCurrentUser,
  useModerators,
  usePermissions,
  useProject,
  useProjectRole,
  useTranslators,
} from '../utils/hooks'
import { useUser } from '../lib/UserContext'

function ProjectEdit({ code }) {
  const { user, session } = useUser()
  const [currentUser] = useCurrentUser({
    token: session?.access_token,
    id: user?.id,
  })

  const role = useProjectRole({
    token: session?.access_token,
    code,
    userId: user?.id,
    isAdmin: currentUser?.is_admin,
  })

  const [permissions] = usePermissions({ token: session?.access_token, role })
  const [project] = useProject({ token: session?.access_token, role })

  const [translators] = useTranslators({
    token: session?.access_token,
    code,
  })
  const [coordinators] = useCoordinators({
    token: session?.access_token,
    code,
  })
  const [moderators] = useModerators({
    token: session?.access_token,
    code,
  })
  return (
    <div>
      <div className="text-3xl mb-10">{project?.title}</div>
      <div className="divide-y divide-gray-500 ">
        <div>
          Moderators:
          <div className=" my-5 flex flex-col ">
            {moderators?.data.length > 0 ? (
              moderators.data.map((el, key) => {
                return (
                  <div className="flex" key={key}>
                    <div className="mx-5 flex" key={key}>
                      {el.users.email}
                    </div>
                    {((permissions?.data &&
                      permissions.data
                        .map((el) => el.permission)
                        .includes('moderator.set')) ||
                      role === 'admin') && (
                      <button className="btn-filled w-28 my-1">Изменить</button>
                    )}
                  </div>
                )
              })
            ) : (
              <button className="btn-filled w-28 my-1">Добавить</button>
            )}
          </div>
        </div>
        <div>
          Coordinators:
          <div className="my-5 flex flex-col ">
            {coordinators?.data.length > 0 ? (
              coordinators.data.map((el, key) => {
                return (
                  <div className="flex" key={key}>
                    <div className="mx-5 flex" key={key}>
                      {el.users.email}
                    </div>
                    {((permissions?.data &&
                      permissions.data
                        .map((el) => el.permission)
                        .includes('coordinator.set')) ||
                      role === 'admin') && (
                      <button className="btn-filled w-28 my-1">Удалить</button>
                    )}
                  </div>
                )
              })
            ) : (
              <button className="btn-filled w-28 my-1">Добавить</button>
            )}
          </div>
        </div>
        <div>
          Translators:
          <div className="my-5 flex flex-col ">
            {translators?.data &&
              translators.data.map((el, key) => {
                return (
                  <div className="flex" key={key}>
                    <div className="mx-5">{el.users.email}</div>
                    {((permissions?.data &&
                      permissions.data
                        .map((el) => el.permission)
                        .includes('translator.set')) ||
                      role === 'admin') && (
                      <button className="btn-filled w-28 my-1">Удалить</button>
                    )}
                  </div>
                )
              })}

            {((permissions?.data &&
              permissions.data.map((el) => el.permission).includes('translator.set')) ||
              role === 'admin') && (
              <button className="btn-filled w-28 my-1">Добавить</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectEdit
