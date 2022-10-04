import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import VerseDistributor from 'components/VerseDistributor'
import { supabase } from 'utils/supabaseClient'

function ChapterVersesPage() {
  const router = useRouter()
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
        .select('id,num,text')
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
  return (
    <>
      <h2>Project {project?.code}</h2>
      <h3>Book: {book?.code}</h3>
      <h3>Chapter: {chapter?.num}</h3>
      <VerseDistributor verses={verses} />
    </>
  )
}

export default ChapterVersesPage

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['projects', 'common'])),
      // Will be passed to the page component as props
    },
  }
}
