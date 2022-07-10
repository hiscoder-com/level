import React from 'react'

import {
  useCoordinators,
  useModerators,
  usePermissions,
  useProject,
  useTranslators,
} from '../utils/hooks'
import { useUser } from '../lib/UserContext'

function ProjectEdit({ code, role }) {
  const { session } = useUser()
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
            {moderators &&
              moderators?.data.map((el, key) => {
                return (
                  <div className="flex" key={key}>
                    <div className="mx-5 flex" key={key}>
                      {el.users.email}
                    </div>
                    {permissions?.data
                      .map((el) => el.permission)
                      .includes('moderator.set') && (
                      <button className="btn-filled w-28 my-1">Удалить</button>
                    )}
                  </div>
                )
              })}
          </div>
        </div>
        <div>
          Coordinators:
          <div className="my-5 flex flex-col ">
            {coordinators &&
              coordinators.data.map((el, key) => {
                return (
                  <div className="flex" key={key}>
                    <div className="mx-5 flex" key={key}>
                      {el.users.email}
                    </div>
                    {permissions?.data
                      .map((el) => el.permission)
                      .includes('coordinator.set') && (
                      <button className="btn-filled w-28 my-1">Удалить</button>
                    )}
                  </div>
                )
              })}
          </div>
        </div>
        <div>
          Translators:
          <div className="my-5 flex flex-col ">
            {translators &&
              translators.data.map((el, key) => {
                return (
                  <div className="flex" key={key}>
                    <div className="mx-5">{el.users.email}</div>
                    {permissions?.data
                      .map((el) => el.permission)
                      .includes('translator.set') && (
                      <button className="btn-filled w-28 my-1">Удалить</button>
                    )}
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectEdit
