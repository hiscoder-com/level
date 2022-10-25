import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import VerseDivider from 'components/VerseDivider'

import { supabase } from 'utils/supabaseClient'

function ChapterVersesPage() {
  const router = useRouter()
  const { t } = useTranslation(['common', 'chapters'])
  const { code, bookid, chapterid } = router.query
  const [project, setProject] = useState()
  const [book, setBook] = useState()
  const [chapter, setChapter] = useState()
  const [verses, setVerses] = useState([])

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
  }, [book?.id, chapterid, project?.id])

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

  const startChapter = () => {
    supabase
      .rpc('start_chapter', { chapter_id: chapter?.id, project_id: project?.id })
      .then((res) => console.log('Start Chapter', res))
  }

  const finishedChapter = () => {
    supabase
      .rpc('finished_chapter', { chapter_id: chapter?.id, project_id: project?.id })
      .then((res) => console.log('Finished Chapter', res))
  }

  return (
    <>
      <h2>
        {t('Project')}: {project?.title} ({project?.code})
      </h2>
      <h3>
        {t('Book')}: {book?.code}
      </h3>
      <h3>
        {t('Chapter')}: {chapter?.num}
      </h3>
      <VerseDivider verses={verses} />
      {chapter?.started_at ? (
        <div>
          {t('chapters:StartedAt')} {chapter?.started_at}
        </div>
      ) : (
        <div className="btn btn-cyan" onClick={startChapter}>
          {t('chapters:StartChapter')}
        </div>
      )}
      {!chapter?.started_at ? (
        ''
      ) : chapter?.finished_at ? (
        <div className="mt-3">
          {t('chapters:FinishedAt')} {chapter?.finished_at}
        </div>
      ) : (
        <div className="btn btn-cyan mt-3" onClick={finishedChapter}>
          {t('chapters:FinishedChapter')}
        </div>
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
      ])),
      // Will be passed to the page component as props
    },
  }
}
