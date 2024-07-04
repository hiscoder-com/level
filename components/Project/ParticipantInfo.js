import { useMemo } from 'react'

import { useTranslation } from 'next-i18next'

import TranslatorImage from 'components/TranslatorImage'
import Card from './Card'

import { useCoordinators, useTranslators } from 'utils/hooks'

function ParticipantInfo({ project, access }) {
  const { t } = useTranslation()
  const [translators] = useTranslators({
    code: project?.code,
    revalidateIfStale: true,
  })
  const [coordinators] = useCoordinators({
    code: project?.code,
    revalidateIfStale: true,
  })

  const participants = useMemo(() => {
    if (coordinators && translators) {
      const _translators = translators.filter(
        (translator) =>
          !coordinators
            .map((coordinator) => coordinator.users.id)
            .includes(translator.users.id)
      )
      const _coordinators = coordinators.map((coordinator) => ({
        ...coordinator,
        is_coordinator: true,
      }))

      return [..._coordinators, ..._translators]
    }
  }, [coordinators, translators])
  return (
    <Card
      title={t('Participants')}
      link={`${project?.code}/edit?setting=participants`}
      isOpen={false}
      access={access}
    >
      {project && (
        <div className="grid grid-cols-1 lg:grid-cols-2 auto-rows-fr gap-2">
          {participants?.map((participant, index) => (
            <div
              key={index}
              className="flex items-center gap-4 px-4 py-1 border border-th-primary-100-hover-background rounded-3xl"
            >
              <div className="w-7 h-7 min-w-[2rem]">
                <TranslatorImage item={participant} />
              </div>
              <div className="truncate">
                <p className="text-lg truncate">{participant?.users?.login}</p>
                <div className="text-sm">
                  {participant.is_coordinator ? (
                    <p>{t('Coordinator')}</p>
                  ) : participant.is_moderator ? (
                    <p>{t('Moderator')}</p>
                  ) : (
                    <p>{t('Translator')}</p>
                  )}
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
