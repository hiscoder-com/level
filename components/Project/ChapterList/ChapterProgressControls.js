import { useState } from 'react'

import ButtonLoading from 'components/ButtonLoading'

function ChapterProgressControls({
  chapter,
  isValidating,
  isLoading,
  verses,
  supabase,
  project,
  mutateChapter,
  mutateChapters,
  setIsChapterStarted,
  t,
}) {
  const [isLoadingCancelFinish, setIsLoadingCancelFinish] = useState(false)

  const changeFinishChapter = () => {
    setIsLoadingCancelFinish(true)
    supabase
      .rpc('change_finish_chapter', {
        chapter_id: chapter?.id,
        project_id: project?.id,
      })
      .then(() => {
        mutateChapter()
        mutateChapters()
      })
      .catch(console.log)
      .finally(() => setIsLoadingCancelFinish(false))
  }
  const changeStartChapter = () => {
    supabase
      .rpc('change_start_chapter', {
        chapter_id: chapter?.id,
        project_id: project?.id,
      })
      .then(() => {
        mutateChapter()
        mutateChapters()
        setIsChapterStarted(true)
      })
      .catch(console.log)
  }
  return (
    <>
      {!chapter?.finished_at &&
        (!chapter?.started_at ? (
          <ButtonLoading
            onClick={changeStartChapter}
            isLoading={isValidating || isLoading}
            disabled={
              chapter?.finished_at ||
              isValidating ||
              verses?.some((verse) => {
                return verse.project_translator_id === null
              })
            }
            className="relative btn-primary"
          >
            {t('chapters:StartChapter')}
          </ButtonLoading>
        ) : (
          ''
        ))}
      {chapter?.started_at && (
        <ButtonLoading
          onClick={changeFinishChapter}
          color={!chapter?.finished_at ? 'secondary' : 'primary'}
          className="relative btn-primary"
          disabled={isValidating}
          isLoading={isLoadingCancelFinish}
        >
          {!chapter?.finished_at
            ? t('chapters:FinishedChapter')
            : t('chapters:CancelFinishedChapter')}
        </ButtonLoading>
      )}
    </>
  )
}

export default ChapterProgressControls
