import { useRouter } from 'next/router'

import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { supabase } from 'utils/supabaseClient'
import { useEffect, useState } from 'react'

function ChapterVersesPage() {
  const router = useRouter()
  const { code, bookid, chapterid } = router.query
  const [project, setProject] = useState()
  const [book, setBook] = useState()
  const [chapter, setChapter] = useState()
  const [verses, setVerses] = useState()

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
  const handleCreate = async (book_code) => {
    await supabase.from('books').insert([
      {
        code: book_code,
        project_id: project.id,
        chapters: { '1': 10, '2': 15, '3': 10 },
      },
    ])
  }
  useEffect(() => {
    const getBook = async () => {
      const { data: book, error } = await supabase
        .from('books')
        .select('code,chapters')
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
    if (book?.chapters) {
      let chaptersList = []
      for (const chapter in book.chapters) {
        if (Object.hasOwnProperty.call(book.chapters, chapter)) {
          chaptersList.push(
            <div>
              {chapter}:{book.chapters[chapter]}
            </div>
          )
        }
      }
      setChapters(chaptersList)
    }
  }, [book?.chapters])
  return (
    <>
      <h2>Project {project?.code}: Book</h2>
      <h3>Book: {book?.code}</h3>
      {chapters}
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
