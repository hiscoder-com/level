import { useRouter } from 'next/router'

import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { supabase } from 'utils/supabaseClient'
import { useEffect, useState } from 'react'

function ProjectBooksPage() {
  const router = useRouter()
  const { code } = router.query
  const [project, setProject] = useState()
  const [books, setBooks] = useState()

  /**
   * 1. Получить список книг проекта
   * 2. Сделать выпадающий список из книг, которые можно создать
   */
  useEffect(() => {
    const getProject = async () => {
      const { data: project, error } = await supabase
        .from('projects')
        .select()
        .eq('code', code)
      setProject(project[0])
    }
    getProject()
  }, [code])

  useEffect(() => {
    const getBooks = async () => {
      const { data: books, error } = await supabase
        .from('books')
        .select('code,chapters')
        .eq('project_id', project.id)
      setBooks(books)
    }
    if (project?.id) {
      getBooks()
    }
  }, [project?.id])

  return (
    <>
      <h2>Project {project?.code}: Books</h2>
      {books?.map((el) => (
        <div key={el.code}>
          {el.code} | {JSON.stringify(el.chapters, null, 2)}
          <br />
        </div>
      ))}
      {project?.base_manifest?.books?.map((el) => (
        <div key={el.name}>
          {el.name} | {el.link}
          <br />
        </div>
      ))}
    </>
  )
}

export default ProjectBooksPage

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['projects', 'common'])),
      // Will be passed to the page component as props
    },
  }
}
