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
  const chapterId = chapter?.id
  const isChapterStarted = chapter?.started_at
  const isChapterFinished = chapter?.finished_at
  const projectId = project?.id

  const changeFinishChapter = () => {
    setIsLoadingCancelFinish(true)
    supabase
      .rpc('change_finish_chapter', {
        chapter_id: chapterId,
        project_id: projectId,
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
        chapter_id: chapterId,
        project_id: projectId,
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
      {!isChapterStarted ? (
        <ButtonLoading
          onClick={changeStartChapter}
          isLoading={isValidating || isLoading}
          disabled={
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
        <ButtonLoading
          onClick={changeFinishChapter}
          color={!isChapterFinished ? 'secondary' : 'primary'}
          className="relative btn-primary"
          disabled={isValidating}
          isLoading={isLoadingCancelFinish}
        >
          {!isChapterFinished
            ? t('chapters:FinishedChapter')
            : t('chapters:CancelFinishedChapter')}
        </ButtonLoading>
      )}
    </>
  )
}

export default ChapterProgressControls
