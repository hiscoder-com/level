import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { supabase } from 'utils/supabaseClient'

function BookChaptersPage() {
  const { query, push } = useRouter()
  const { t } = useTranslation(['common', 'chapters'])
  const { code, bookid } = query
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
  const handleCreate = async (chapter_id, num) => {
    const res = await supabase.rpc('create_verses', { chapter_id })
    if (res.data) {
      push('/projects/' + code + '/books/' + bookid + '/' + num)
    }
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
      <h3 className="h3 mb-4">
        <Link href={'/projects/' + code}>
          <a className="underline text-blue-700">« {project?.title}</a>
        </Link>
      </h3>
      <h4 className="h4 mb-3">
        {t('Book')}: {t(`books:${book?.code}`)}
      </h4>
      {chapters?.map((chapter) => (
        <div key={chapter.id}>
          {t('Chapter')} {chapter.num} ({t('Verses')}: {chapter.verses})
          {!createdChapters.includes(chapter.id) ? (
            <div
              className="btn btn-white ml-8 mb-3"
              onClick={() => handleCreate(chapter.id, chapter.num)}
            >
              {t('Create')}
            </div>
          ) : (
            <Link
              href={
                '/projects/' + project.code + '/books/' + book.code + '/' + chapter.num
              }
            >
              <a className="btn btn-cyan ml-8 mb-3">{t('chapters:Created')}</a>
            </Link>
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
      ...(await serverSideTranslations(locale, [
        'projects',
        'common',
        'chapters',
        'books',
      ])),
    },
  }
}
