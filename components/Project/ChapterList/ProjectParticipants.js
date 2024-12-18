import SwitchLoading from 'components/Panel/UI/SwitchLoading'
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
    <div className="mb-2.5 space-y-2.5">
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
              className={`flex w-5/6 flex-1 items-center gap-4 rounded-3xl border px-4 py-1 ${
                assignedTranslatorsIds?.includes(participant.id)
                  ? 'bg-th-secondary-200 text-th-text-secondary-100'
                  : ''
              } ${
                currentTranslator?.users?.login === participant.users.login
                  ? `${participant.color.bg} ${participant.color.border}`
                  : `${participant.color.text} text-th-text-primary`
              }`}
            >
              <div className="h-7 w-7 min-w-[2rem]">
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
            <div onClick={(e) => e.stopPropagation()} className="w-1/6">
              <SwitchLoading
                id={`translator-${participant.id}`}
                checked={assignedTranslatorsIds?.includes(participant.id) ?? false}
                withDelay={true}
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
                disabled={assignedVerseTranslators?.includes(participant.id)}
              />
            </div>
          </div>
        ))
      ) : (
        <>
          {[...Array(4).keys()].map((el) => (
            <div role="status" className="w-full animate-pulse" key={el}>
              <div className="h-[68px] w-full rounded-2xl bg-th-secondary-100"></div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

export default ProjectParticipants
