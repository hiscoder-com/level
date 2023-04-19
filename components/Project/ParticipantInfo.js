import { useMemo } from 'react'

import { useTranslation } from 'next-i18next'

import TranslatorImage from 'components/TranslatorImage'
import Card from './Card'

import { useCoordinators, useTranslators } from 'utils/hooks'

function ParticipantInfo({ project, user, access }) {
  const { t } = useTranslation()
  const [translators] = useTranslators({
    token: user?.access_token,
    code: project?.code,
  })
  const [coordinators] = useCoordinators({
    token: user?.access_token,
    code: project?.code,
  })
  const moderators = useMemo(() => {
    if (translators) {
      return translators.filter((translator) => translator.is_moderator)
    }
  }, [translators])

  return (
    <Card
      title={t('Participants')}
      link={`${project?.code}/edit#participants`}
      access={access}
    >
      {project && (
        <div className="flex flex-col gap-4">
          {[
            {
              label: translators?.length > 1 ? 'Translators' : 'Translator',
              value: translators,
            },
            {
              label: moderators?.length > 1 ? 'Moderators' : 'Moderator',
              value: moderators,
            },
            {
              label: translators?.length > 1 ? 'Coordinators' : 'Coordinator',
              value: coordinators,
            },
          ].map(
            (role) =>
              role?.value?.length > 0 && (
                <div key={role?.label} className="flex gap-2 text-sm h4-5 lg:text-lg">
                  <p className="w-1/2">
                    {t(role?.label)}
                    {':'}
                  </p>
                  <div className="flex flex-col w-1/2 gap-4">
                    {role?.value?.map((translator) => (
                      <div key={translator?.id} className="flex gap-2">
                        <div className="w-8">
                          <TranslatorImage item={translator} />
                        </div>
                        <p>{translator?.users?.login}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
          )}
        </div>
      )}
    </Card>
  )
}

export default ParticipantInfo
