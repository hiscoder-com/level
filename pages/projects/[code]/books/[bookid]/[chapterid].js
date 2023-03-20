import { useRouter } from 'next/router'
import Link from 'next/link'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import VerseDivider from 'components/VerseDivider'

import { supabase } from 'utils/supabaseClient'
import { readableDate } from 'utils/helper'
import {
  useGetBook,
  useGetChapter,
  useGetChapters,
  useGetVerses,
  useProject,
} from 'utils/hooks'
import { useCurrentUser } from 'lib/UserContext'
import Spinner from 'public/spinner.svg'

function ChapterVersesPage() {
  const {
    locale,
    query: { code, bookid, chapterid },
  } = useRouter()
  const { t } = useTranslation(['common', 'chapters'])
  const { user } = useCurrentUser()

  const [project] = useProject({ token: user?.access_token, code })
  const [book] = useGetBook({ token: user?.access_token, code, book_code: bookid })
  const [chapter, { isLoading, mutate: mutateChapter, isValidating }] = useGetChapter({
    token: user?.access_token,
    code,
    book_code: bookid,
    chapter_id: chapterid,
  })
  const [_, { mutate: mutateChapters }] = useGetChapters({
    token: user?.access_token,
    code,
    book_code: bookid,
  })
  const [verses] = useGetVerses({
    token: user?.access_token,
    code,
    book_code: bookid,
    chapter_id: chapter?.id,
  })

  const changeStartChapter = () => {
    supabase
      .rpc('change_start_chapter', {
        chapter_id: chapter?.id,
        project_id: project?.id,
      })
      .then(() => {
        mutateChapter()
        mutateChapters()
      })
      .catch(console.log)
  }

  const changeFinishChapter = () => {
    supabase
      .rpc('change_finish_chapter', {
        chapter_id: chapter?.id,
        project_id: project?.id,
      })
      .then(() => {
        mutateChapter()
        mutateChapters()
      })
  }

  return (
    <>
      <h3 className="h3 mb-4">
        <Link href={'/projects/' + code}>
          <a className="underline text-blue-700">« {project?.title}</a>
        </Link>
      </h3>
      <h4 className="h4 mb-3">
        <Link href={'/projects/' + code + '?book=' + bookid}>
          <a className="underline text-blue-700">« {t(`books:${book?.code}`)}</a>
        </Link>
      </h4>
      <h3 className="h4 mb-3">
        {t('Chapter')}: {chapter?.num}
      </h3>
      <VerseDivider verses={verses} />

      <button
        className={`btn ${!chapter?.started_at ? 'btn-cyan' : 'btn-red'} mt-4`}
        onClick={changeStartChapter}
        disabled={chapter?.finished_at || isValidating}
      >
        {isValidating || isLoading ? (
          <Spinner className="animate-spin my-0 mx-auto h-5 w-5 text-blue-600" />
        ) : !chapter?.started_at ? (
          t('chapters:StartChapter')
        ) : (
          t('chapters:CancelStartChapter')
        )}
      </button>
      {chapter?.started_at && (
        <div>
          {t('Chapter')} {t('chapters:StartedAt').toLowerCase()}{' '}
          {readableDate(chapter?.started_at, locale)}
        </div>
      )}
      {!isValidating && chapter?.started_at && (
        <>
          <button
            className={`btn ${!chapter?.finished_at ? 'btn-cyan' : 'btn-red'} mt-4`}
            onClick={changeFinishChapter}
            disabled={isValidating}
          >
            {isValidating || isLoading ? (
              <Spinner className="animate-spin my-0 mx-auto h-5 w-5 text-blue-600" />
            ) : !chapter?.finished_at ? (
              t('chapters:FinishedChapter')
            ) : (
              t('chapters:CancelFinishedChapter')
            )}
          </button>
          {!isValidating && chapter?.finished_at && (
            <div>
              {t('Chapter')} {t('chapters:FinishedAt').toLowerCase()}{' '}
              {readableDate(chapter?.finished_at, locale)}
            </div>
          )}
        </>
      )}
    </>
  )
}

export default ChapterVersesPage

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        'projects',
        'common',
        'chapters',
        'books',
        'users',
      ])),
    },
  }
}
