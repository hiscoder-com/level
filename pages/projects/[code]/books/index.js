import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import axios from 'axios'

import { supabase } from 'utils/supabaseClient'
import { useCurrentUser } from 'lib/UserContext'

function ProjectBooksPage() {
  const { user } = useCurrentUser()
  const {
    query: { code },
    push,
  } = useRouter()
  const { t } = useTranslation(['common'])
  const [project, setProject] = useState()
  const [books, setBooks] = useState()
  const [selectedBook, setSelectedBook] = useState('')

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

  const handleCreate = async () => {
    const book = project?.base_manifest?.books.find((el) => el.name === selectedBook)
    if (!book) {
      return
    }
    axios.defaults.headers.common['token'] = user?.access_token
    const res = await axios.post('/api/create_chapters', {
      project_id: project.id,
      link: book.link,
      book_code: selectedBook,
    })

    if (res.status === 201) {
      push('/projects/' + code + '/books/' + selectedBook)
    }
  }

  useEffect(() => {
    const getBooks = async () => {
      const { data: books, error } = await supabase
        .from('books')
        .select('code,chapters')
        .eq('project_id', project.id)
      setBooks(books)
      const defaultVal = project?.base_manifest?.books?.filter(
        (el) => !books?.map((el) => el.code)?.includes(el.name)
      )?.[0]?.name
      if (defaultVal) {
        setSelectedBook(defaultVal)
      }
    }
    if (project?.id) {
      getBooks()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id])

  return (
    <>
      <h3 className="h3">
        <Link href={'/projects/' + code}>
          <a className="underline text-blue-700">« {project?.title}</a>
        </Link>
      </h3>
      <p className="mt-4 mb-3 h4">{t('Books')}</p>
      {books?.map((el) => (
        <Link key={el.code} href={'/projects/' + project.code + '/books/' + el.code}>
          <a className="block text-blue-700 underline">{t(`books:${el.code}`)}</a>
        </Link>
      ))}
      <select onChange={(e) => setSelectedBook(e.target.value)} value={selectedBook}>
        {project?.base_manifest?.books
          ?.filter((el) => !books?.map((el) => el.code)?.includes(el.name))
          .map((el) => (
            <option value={el.name} key={el.name}>
              {t(`books:${el.name}`)}
            </option>
          ))}
      </select>
      <div className="btn btn-cyan" onClick={handleCreate}>
        {t('Create')}
      </div>
    </>
  )
}

export default ProjectBooksPage

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['projects', 'common', 'books'])),
    },
  }
}
