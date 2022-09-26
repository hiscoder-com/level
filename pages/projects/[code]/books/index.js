import { useRouter } from 'next/router'
import usfm from 'usfm-js'
import axios from 'axios'

import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { supabase } from 'utils/supabaseClient'
import { useEffect, useState } from 'react'

function ProjectBooksPage() {
  const router = useRouter()
  const { code } = router.query
  const [project, setProject] = useState()
  const [books, setBooks] = useState()
  const [selectedBook, setSelectedBook] = useState(null)
  const [listenChanges, setListenChanges] = useState('false')

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
        .single()
      setProject(project)
    }
    getProject()
  }, [code])
  const handleCreate = async (book_code) => {
    const book = project?.base_manifest?.books.find((el) => el.name === book_code)
    if (!book) {
      return
    }
    const bookUrl = book?.link.split('/')
    bookUrl.splice(2, 0, 'raw/commit')
    bookUrl.splice(0, 0, 'https://git.door43.org')
    const countOfChaptersAndVerses = {}
    await axios
      .get(bookUrl.join('/'))
      .then((res) => {
        const jsonData = usfm.toJSON(res.data)
        Object.values(jsonData.chapters).forEach((el, index) => {
          countOfChaptersAndVerses[index + 1] = Object.keys(el).filter(
            (verse) => verse !== 'front'
          ).length
        })
      })
      .catch((error) => {
        console.log(error)
      })

    if (Object.keys(countOfChaptersAndVerses).length !== 0) {
      setListenChanges((prev) => !prev)
      await supabase.from('books').insert([
        {
          code: book_code,
          project_id: project.id,
          chapters: countOfChaptersAndVerses,
        },
      ])
    }

    // TODO Проверить есть ли такой код книги в проекте
    // TODO спарсить этот файл и получить количество глав и стихов в нем
    // const countOfChaptersAndVerses = { '1': 6, '2': 15, '3': 10 }
  }

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
  }, [project?.id, listenChanges])

  return (
    <>
      <h2>Project {project?.code}: Books</h2>
      {books?.map((el) => (
        <div key={el.code}>
          {el.code} | {JSON.stringify(el.chapters, null, 2)}
        </div>
      ))}
      <select placeholder="select book" onChange={(e) => setSelectedBook(e.target.value)}>
        {project?.base_manifest?.books
          ?.filter((el) => !books?.map((el) => el.code)?.includes(el.name))
          .map((el) => (
            <option selected={0} value={el.name} key={el.name}>
              {el.name} | {el.link.split('/').splice(-1)}
            </option>
          ))}
      </select>
      <div className="btn btn-cyan" onClick={() => handleCreate(selectedBook)}>
        Create
      </div>
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
