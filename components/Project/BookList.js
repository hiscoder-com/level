import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import { BookCreate, ChapterList, DownloadBlock } from './index'
import { supabase } from 'utils/supabaseClient'
import { compileChapter, convertToUsfm } from 'utils/helper'

function BookList({ highLevelAccess, project, user }) {
  const { t } = useTranslation(['common', 'books'])
  const { push, query } = useRouter()
  const [selectedBook, setSelectedBook] = useState(null)
  const [books, setBooks] = useState()

  const getBookJson = async (book_id) => {
    const { data } = await supabase.rpc('handle_compile_book', { book_id })
    return data
  }

  useEffect(() => {
    const getBooks = async () => {
      const { data: books, error } = await supabase
        .from('books')
        .select('id,code,chapters')
        .eq('project_id', project.id)
      setBooks(books)
    }
    if (project?.id) {
      getBooks()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id, query?.book])

  useEffect(() => {
    if (query?.book && books?.length) {
      const book = books?.find((book) => book.code === query?.book)
      setSelectedBook(book)
    } else {
      setSelectedBook(null)
    }
  }, [query, books])

  const compileBook = async (book_id, type = 'txt', bookCode = 'book') => {
    const bookJson = await getBookJson(book_id)
    let main = ''
    if (!bookJson || !Object.keys(bookJson).length > 0) {
      return
    }
    if (type === 'txt') {
      const bookName = t(`books:${bookCode}`)
      const cl = t('Chapter')
      main = convertToUsfm({
        book: { json: bookJson, code: bookCode, title: bookName },
        cl,
        project: {
          code: project?.code,
          title: project?.title,
          language: {
            code: project?.languages?.code,
            orig_name: project?.languages?.orig_name,
          },
        },
      })
    } else {
      for (const [key, value] of Object.entries(bookJson)) {
        if (value) {
          main += ` <h1>${t('Chapter')} ${key}</h1>
        <div>${compileChapter(value, 'html')}</div>`
        }
      }
    }

    return main
  }

  return (
    <>
      {!selectedBook ? (
        <>
          <table className="shadow-md text-sm text-center table-auto text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="py-3 px-6">{t('NameBook')}</th>
                <th className="py-3 px-6">{t('CountChapters')}</th>
                <th className="py-3 px-6"></th>
              </tr>
            </thead>
            <tbody>
              {books?.map((book, index) => (
                <tr
                  key={index}
                  onClick={() => {
                    push({
                      pathname: `/projects/${project?.code}`,
                      query: { book: book?.code },
                      shallow: true,
                    })
                  }}
                  className="cursor-pointer hover:bg-cyan-50 bg-white border-b"
                >
                  <td className="py-4 px-6">{t(`books:${book?.code}`)}</td>
                  <td className="py-4 px-6">{Object.keys(book?.chapters)?.length} </td>

                  <td className="py-4">
                    <DownloadBlock
                      actions={{
                        compile: compileBook,
                      }}
                      state={{
                        txt: {
                          ref: { text: book?.id, bookCode: book?.code },
                          title: `${t('Book')} ${t(`books:${book?.code}`)}.usfm`,
                        },
                        pdf: {
                          ref: { text: book?.id },
                          title: `${t('Book')} ${t(`books:${book?.code}`)}`,
                          projectLanguage: {
                            code: project?.languages?.code,
                            title: project?.languages?.title,
                          },
                        },
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <BookCreate
            selectedBook={selectedBook}
            project={project}
            highLevelAccess={highLevelAccess}
            books={books}
            user={user}
          />
        </>
      ) : (
        <ChapterList
          selectedBook={selectedBook}
          project={project}
          highLevelAccess={highLevelAccess}
        />
      )}
    </>
  )
}
export default BookList
