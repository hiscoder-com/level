import { Switch } from '@headlessui/react'

import TranslatorImage from 'components/TranslatorImage'

function ProjectParticipants({
  participants,
  assignedTranslatorsIds,
  assignedVerseTranslators,
  currentTranslator,
  setCurrentTranslator,
  translatorsSelecting,
  t,
}) {
  return (
    <div className="space-y-2.5 mb-2.5">
      <div className="flex justify-end">{t('chapters:ReadOnly')}</div>
      {participants.length > 0 ? (
        participants?.map((participant, index) => (
          <div
            key={index}
            className="flex items-center gap-2"
            onClick={() => {
              if (!assignedTranslatorsIds?.includes(participant.id)) {
                setCurrentTranslator(participant)
              }
            }}
          >
            <div
              className={`flex flex-1 items-center gap-4 px-4 py-1 border rounded-3xl w-5/6 ${
                assignedTranslatorsIds?.includes(participant.id)
                  ? 'bg-th-secondary-200 text-th-text-secondary-100'
                  : ''
              } ${
                currentTranslator?.users?.login === participant.users.login
                  ? `${participant.color.bg} ${participant.color.border}`
                  : `${participant.color.text} text-th-text-primary`
              }`}
            >
              <div className="w-7 h-7 min-w-[2rem]">
                <TranslatorImage item={participant} />
              </div>
              <div>
                <p className="text-lg">{participant?.users?.login}</p>
                <div className="text-sm">
                  {participant.is_moderator ? (
                    <p>{t('Moderator')}</p>
                  ) : (
                    <p>{t('Translator')}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="w-1/6">
              <Switch
                disabled={assignedVerseTranslators?.includes(participant.id)}
                checked={assignedTranslatorsIds?.includes(participant.id) ?? false}
                onChange={() => {
                  if (!assignedVerseTranslators?.includes(participant.id)) {
                    translatorsSelecting(participant)
                  }
                  if (
                    participant.id === currentTranslator?.id &&
                    !assignedVerseTranslators?.includes(participant.id)
                  ) {
                    setCurrentTranslator(null)
                  }
                }}
                className={`${
                  assignedTranslatorsIds?.includes(participant.id)
                    ? 'bg-secondary-10'
                    : 'bg-th-secondary-200 border-th-secondary-200'
                } relative inline-flex h-7 w-12 items-center border rounded-full`}
              >
                <span
                  className={`${
                    assignedTranslatorsIds?.includes(participant.id)
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  } inline-block h-5 w-5 transform rounded-full ${
                    assignedVerseTranslators?.includes(participant.id)
                      ? 'bg-th-secondary-10 cursor-default'
                      : 'bg-th-primary-100'
                  } transition`}
                />
              </Switch>
            </div>
          </div>
        ))
      ) : (
        <>
          {[...Array(4).keys()].map((el) => (
            <div role="status" className="w-full animate-pulse" key={el}>
              <div className="h-[68px] bg-th-secondary-100 rounded-2xl w-full"></div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

export default ProjectParticipants
