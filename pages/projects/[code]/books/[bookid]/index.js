import { useRouter } from 'next/router'

import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { supabase } from 'utils/supabaseClient'
import { useEffect, useState } from 'react'

function BookChaptersPage() {
  const router = useRouter()
  const { code, bookid } = router.query
  const [project, setProject] = useState()
  const [book, setBook] = useState()
  const [chapters, setChapters] = useState([])
  const [createdChapters, setCreatedChapters] = useState([])

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
  const handleCreate = async (chapter_id) => {
    await supabase.rpc('create_verses', { chapter_id })
  }
  useEffect(() => {
    const getBook = async () => {
      const { data: book, error } = await supabase
        .from('books')
        .select('id,code,chapters')
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
    const getChapters = async () => {
      const { data: chapters, error } = await supabase
        .from('chapters')
        .select('id,num,verses,text')
        .eq('project_id', project.id)
        .eq('book_id', book.id)
      setChapters(chapters)
    }
    if (project?.id && book?.id) {
      getChapters()
    }
  }, [book?.id, project?.id])

  useEffect(() => {
    const getCreatedChapters = async () => {
      const { data: createdChaptersRaw, error } = await supabase
        .from('verses')
        .select('chapter_id')
        .eq('project_id', project.id)
        .in(
          'chapter_id',
          chapters.map((el) => el.id)
        )
      const createdChapters = new Set(createdChaptersRaw.map((el) => el.chapter_id))
      setCreatedChapters([...createdChapters])
    }
    if (project?.id && chapters?.length) {
      getCreatedChapters()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapters?.length, project?.id])

  return (
    <>
      <h2>Project {project?.code}: Book</h2>
      <h3>Book: {book?.code}</h3>
      {chapters?.map((chapter) => (
        <div key={chapter.id}>
          {chapter.num}:{chapter.verses} {console.log('1', createdChapters)}
          {!createdChapters.includes(chapter.id) ? (
            <div onClick={() => handleCreate(chapter.id)}>Create</div>
          ) : (
            <div>Created...</div>
          )}
        </div>
      ))}
    </>
  )
}

export default BookChaptersPage

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['projects', 'common'])),
      // Will be passed to the page component as props
    },
  }
}
