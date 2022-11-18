import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import VerseDivider from 'components/VerseDivider'

import { supabase } from 'utils/supabaseClient'
import Link from 'next/link'

function ChapterVersesPage() {
  const router = useRouter()
  const { t } = useTranslation(['common', 'chapters'])
  const { code, bookid, chapterid } = router.query
  const [project, setProject] = useState()
  const [book, setBook] = useState()
  const [chapter, setChapter] = useState()
  const [verses, setVerses] = useState([])
  const [changing, setChanging] = useState(false)

  useEffect(() => {
    const getProject = async () => {
      const { data: project, error } = await supabase
        .from('projects')
        .select()
        .eq('code', code)
        .single()
      setProject(project)
    }
    getProject()
  }, [code])

  useEffect(() => {
    const getBook = async () => {
      const { data: book, error } = await supabase
        .from('books')
        .select('id,code')
        .eq('project_id', project.id)
        .eq('code', bookid)
        .single()
      setBook(book)
    }
    if (project?.id) {
      getBook()
    }
  }, [bookid, project?.id])

  useEffect(() => {
    const getChapter = async () => {
      const { data: chapter, error } = await supabase
        .from('chapters')
        .select('id,num,text,started_at,finished_at')
        .eq('project_id', project.id)
        .eq('num', chapterid)
        .eq('book_id', book.id)
        .single()
      setChapter(chapter)
    }
    if (project?.id && book?.id) {
      getChapter()
    }
  }, [book?.id, chapterid, project?.id, changing])

  useEffect(() => {
    const getVerses = async () => {
      const { data: verses, error } = await supabase
        .from('verses')
        .select('id,num,text,current_step,project_translator_id')
        .eq('project_id', project.id)
        .eq('chapter_id', chapter.id)
      setVerses(verses)
    }
    if (project?.id && chapter?.id) {
      getVerses()
    }
  }, [chapter?.id, project?.id])

  const changeStartChapter = () => {
    setChanging(true)
    supabase
      .rpc('change_start_chapter', { chapter_id: chapter?.id, project_id: project?.id })
      .then((res) => {
        console.log('Start Chapter', res)
        setChanging(false)
      })
      .catch((error) => {
        console.log(error)
        setChanging(false)
      })
  }
  const changeFinishChapter = () => {
    setChanging(true)
    supabase
      .rpc('change_finish_chapter', { chapter_id: chapter?.id, project_id: project?.id })
      .then((res) => {
        console.log('Finish Chapter', res)
        setChanging(false)
      })
      .catch((error) => {
        console.log(error)
        setChanging(false)
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
        disabled={chapter?.finished_at}
      >
        {!chapter?.started_at
          ? t('chapters:StartChapter')
          : t('chapters:CancelStartChapter')}
      </button>
      {chapter?.started_at && (
        <div>
          {t('common:Chapter')} {t('chapters:StartedAt').toLowerCase()}{' '}
          {new Date(chapter?.started_at).toLocaleString('ru', {})}
        </div>
      )}
      {chapter?.started_at && (
        <>
          <div
            className={`btn ${!chapter?.finished_at ? 'btn-cyan' : 'btn-red'} mt-4`}
            onClick={changeFinishChapter}
          >
            {!chapter?.finished_at
              ? t('chapters:FinishedChapter')
              : t('chapters:CancelFinishedChapter')}
          </div>
          {chapter?.finished_at && (
            <div>
              {t('common:Chapter')} {t('chapters:FinishedAt').toLowerCase()}{' '}
              {new Date(chapter?.finished_at).toLocaleString('ru', {})}
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
        'verses',
        'chapters',
        'books',
      ])),
    },
  }
}
