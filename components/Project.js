import { useCurrentUser } from 'lib/UserContext'
import { useProject, useTranslators } from 'utils/hooks'

import { useTranslation } from 'next-i18next'

function Project({ code }) {
  const { t } = useTranslation(['projects'])

  const { user } = useCurrentUser()

  const [project] = useProject({ token: user?.access_token, code })

  const [translators] = useTranslators({
    token: user?.access_token,
    code: code,
  })

  return (
    <div>
      <h3 className="text-3xl">
        <b>{project?.title}</b>
      </h3>

      <div>
        {t('Code')} <b>{project?.code}</b>
      </div>
      <div>
        {t('Language')}{' '}
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
            {t('Translators')}:
            {translators.map((el, key) => {
              return (
                <div className="font-bold" key={key}>
                  {`${el.users.login} ${el.users.email}`}
                  {el.is_moderator ? '(Moderator)' : ''}
                </div>
              )
            })}
          </>
        )}
        {/* {user?.is_admin ||
          (['admin', 'coordinator'].includes(projectRole) && (
            <Link key={project?.id} href={`/projects/${project?.code}/edit`}>
              <a className="btn btn-filled btn-cyan">{t('ProjectEditing')}</a>
            </Link>
          ))} */}
      </div>
    </div>
  )
}

export default Project
