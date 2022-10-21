import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import usfm from 'usfm-js'
import axios from 'axios'

import { supabase } from 'utils/supabaseClient'

function ProjectBooksPage() {
  const {
    query: { code },
  } = useRouter()
  const [project, setProject] = useState()
  const [books, setBooks] = useState()
  const [selectedBook, setSelectedBook] = useState(null)

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
    const countOfChaptersAndVerses = {}
    await axios
      .get(book.link)
      .then((res) => {
        const jsonData = usfm.toJSON(res.data)
        if (Object.entries(jsonData?.chapters).length > 0) {
          Object.entries(jsonData?.chapters).forEach((el) => {
            countOfChaptersAndVerses[el[0]] = Object.keys(el[1]).filter(
              (verse) => verse !== 'front'
            ).length
          })
        }
      })
      .catch((error) => {
        console.log(error)
      })

    if (Object.keys(countOfChaptersAndVerses).length !== 0) {
      await supabase.from('books').insert([
        {
          code: book_code,
          project_id: project.id,
          chapters: countOfChaptersAndVerses,
        },
      ])
    }
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
  }, [project?.id])

  return (
    <>
      <h2>Project {project?.code}: Books</h2>
      {books?.map((el) => (
        <Link key={el.code} href={'/projects/' + project.code + '/books/' + el.code}>
          <a>
            {el.code} | {JSON.stringify(el.chapters, null, 2)}
          </a>
        </Link>
      ))}
      <select onChange={(e) => setSelectedBook(e.target.value)}>
        {project?.base_manifest?.books
          ?.filter((el) => !books?.map((el) => el.code)?.includes(el.name))
          .map((el) => (
            <option value={el.name} key={el.name}>
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
