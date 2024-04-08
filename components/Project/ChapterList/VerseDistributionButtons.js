import ButtonLoading from 'components/ButtonLoading'

function VerseDistributionButtons({
  translators,
  setVersesDivided,
  versesDivided,
  isChapterStarted,
  assignedTranslatorsIds,
  choosedVerses,
  isNotAllVersesDivided,
  assign,
  reset,
  isTranslatorSelected,
  translator,
  defaultColor,
  t,
  isDivide,
}) {
  function fastDivideVerses(verses, translators) {
    const freeTranslators = translators.filter(
      (translator) => !assignedTranslatorsIds.includes(translator.id)
    )
    const totalVerses = verses.length
    const baseCount = Math.floor(totalVerses / freeTranslators.length)
    let remainingVerses = totalVerses % freeTranslators.length
    let currentStartIndex = 0
    const indexIntervals = freeTranslators.map((_translator, index) => {
      const versesForCurrentTranslator = baseCount + (index < remainingVerses ? 1 : 0)
      const interval = {
        start: currentStartIndex,
        end: currentStartIndex + versesForCurrentTranslator,
      }
      currentStartIndex += versesForCurrentTranslator
      return interval
    })
    return verses.map((verse, index) => {
      const currentTranslatorIndex = indexIntervals.findIndex(
        (interval) => index >= interval.start && index < interval.end
      )
      const assignedTranslator = freeTranslators[currentTranslatorIndex]

      return {
        ...verse,
        project_translator_id: assignedTranslator.id,
        color: assignedTranslator.color,
        translator_name: assignedTranslator?.users?.login,
      }
    })
  }

  function assignVersesToTranslator(verses, translator) {
    return verses.map((verse) => {
      if (verse.project_translator_id) {
        return verse
      }

      return {
        ...verse,
        project_translator_id: translator.id,
        color: translator.color,
        translator_name: translator.users?.login,
      }
    })
  }

  const deselectAllVerses = () => {
    const updatedVerses = versesDivided.map((verse) => ({
      ...verse,
      project_translator_id: null,
      translator_name: '',
      color: defaultColor,
    }))
    setVersesDivided(updatedVerses)
  }

  function hasUnassignedVerses(verses) {
    return verses.some((verse) => !verse.project_translator_id)
  }

  return (
    <>
      <ButtonLoading
        onClick={() => {
          const verses = fastDivideVerses(versesDivided, translators)
          if (!verses) {
            return
          }
          setVersesDivided(verses)
        }}
        disabled={
          !translators?.length ||
          isChapterStarted ||
          assignedTranslatorsIds?.length === translators?.length ||
          isDivide
        }
        className="relative btn-primary"
      >
        {t('chapters:FastDivide')}
      </ButtonLoading>

      <div className="flex gap-4">
        <ButtonLoading
          onClick={() => {
            const assignedVerses = assignVersesToTranslator(versesDivided, translator)
            if (!assignedVerses) {
              return
            }
            setVersesDivided(assignedVerses)
          }}
          disabled={
            !translators?.length ||
            !isTranslatorSelected ||
            isChapterStarted ||
            assignedTranslatorsIds?.includes(translator.id) ||
            !hasUnassignedVerses(versesDivided)
          }
          className="flex-1 relative btn-primary w-fit"
        >
          {t('chapters:SelectAll')}
        </ButtonLoading>
        <ButtonLoading
          onClick={deselectAllVerses}
          disabled={
            !translators?.length || !choosedVerses || isChapterStarted || isDivide
          }
          className="flex-1 relative btn-primary w-fit"
        >
          {t('chapters:Deselect')}
        </ButtonLoading>
      </div>

      <div className="flex gap-4">
        <ButtonLoading
          onClick={assign}
          disabled={!translators?.length || isNotAllVersesDivided || isChapterStarted}
          className="flex-1 relative btn-primary w-fit"
        >
          {t('Assign')}
        </ButtonLoading>
        <ButtonLoading
          onClick={reset}
          disabled={!translators?.length || !choosedVerses || isChapterStarted}
          className="flex-1 relative btn-primary w-fit"
        >
          {t('Reset')}
        </ButtonLoading>
      </div>
    </>
  )
}

export default VerseDistributionButtons
