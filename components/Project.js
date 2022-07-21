import Link from 'next/link'

import { useCurrentUser } from '../lib/UserContext'
import { useProject, useProjectRole, useTranslators } from '@/utils/hooks'

function Project({ code }) {
  const { user } = useCurrentUser()

  const [project] = useProject({ token: user?.access_token, code })

  const [translators] = useTranslators({
    token: user?.access_token,
    code: project?.code,
  })

  const projectRole = useProjectRole({
    token: user?.access_token,
    code,
    userId: user?.id,
    isAdmin: user?.is_admin,
  })
  return (
    <div>
      <h3 className="text-3xl">
        <b>{project?.title}</b>
      </h3>

      <div>
        Code <b>{project?.code}</b>
      </div>
      <div>
        Language{' '}
        {project?.languages && (
          <>
            <b>{project?.languages?.orig_name + ' '}</b>
            <b>{project?.languages?.code}</b>
          </>
        )}
      </div>

      <div>
        {translators && Object.keys(translators).length > 0 && (
          <>
            Translators:
            {translators.map((el, key) => {
              return (
                <div
                  className="font-bold"
                  key={key}
                >{`${el.users.login} ${el.users.email}`}</div>
              )
            })}
          </>
        )}
        {user?.is_admin ||
          (['admin', 'coordinator'].includes(projectRole) && (
            <Link key={project?.id} href={`/projects/${project?.code}/edit`}>
              <a className="btn btn-filled btn-cyan">Редактирование проекта</a>
            </Link>
          ))}
      </div>
    </div>
  )
}

export default Project
