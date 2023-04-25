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
  const participants = useMemo(() => {
    if (coordinators && translators) {
      translators?.sort((a, b) => b.is_moderator - a.is_moderator)
      const _translators = translators.filter(
        (el) =>
          !coordinators.map((coordinator) => coordinator.users.id).includes(el.users.id)
      )
      const _coordinators = coordinators.map((coordinator) => ({
        ...coordinator,
        is_coordinator: true,
        is_moderator: moderators
          ?.map((el) => el.users.id)
          .includes(coordinator?.users.id),
      }))

      return [..._coordinators, ..._translators]
    }
  }, [coordinators, moderators, translators])
  return (
    <Card
      title={t('Participants')}
      link={`${project?.code}/edit/#participants`}
      // TODO warning когда обновляю страницу, а в url - # якорь
      access={access}
    >
      {project && (
        <div className="flex flex-col gap-4">
          {participants?.map((participant, index) => (
            <div key={index}>
              <div className="flex gap-2">
                <div className="w-8">
                  <TranslatorImage item={participant} />
                </div>
                <div>
                  <p className="h4-5">{participant?.users?.login}</p>
                  <div className="h6">
                    {participant.is_coordinator && <p>{t('Coordinator')}</p>}
                    {participant.is_moderator && <p>{t('Moderator')}</p>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

export default ParticipantInfo
