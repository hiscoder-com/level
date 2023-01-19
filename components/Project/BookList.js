import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import { BookCreate, ChapterList, DownloadBlock } from './index'
import { supabase } from 'utils/supabaseClient'
import { compileChapter, convertToUsfm } from 'utils/helper'
import { usfmFileNames } from 'utils/config'

function BookList({ highLevelAccess, project, user }) {
  const { t } = useTranslation(['common', 'books'])
  const { push, query } = useRouter()
  const [selectedBook, setSelectedBook] = useState(null)
  const [books, setBooks] = useState()

  const getBookJson = async (book_id) => {
    const { data } = await supabase
      .from('chapters')
      .select('num,text')
      .eq('book_id', book_id)
      .order('num')
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

  const compileBook = async (ref, type = 'txt') => {
    const chapters = await getBookJson(ref?.book_id)
    let main = ''
    if (chapters?.length === 0) {
      return
    }
    if (type === 'txt') {
      const bookName = t(`books:${ref?.bookCode}`)
      const cl = t('Chapter')
      main = convertToUsfm({
        book: { json: chapters, code: ref?.bookCode, title: bookName },

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
      main = chapters.reduce((html, el) => {
        if (el.text) {
          html += ` <h1>${t('Chapter')} ${el.num}</h1>
        <div>${compileChapter({ json: el.text }, 'html')}</div>`
        }
        return html
      }, '')
    }
    return main
  }

  return (
    <>
      {!selectedBook ? (
        <>
          <table className="shadow-md text-sm text-center table-auto text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th className="py-3 px-6">{t('NameBook')}</th>
                <th className="py-3 px-6">{t('CountChapters')}</th>
                <th className="py-3 px-6">{t('Download')}</th>
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
                  className="cursor-pointer hover:bg-gray-50 bg-white border-b"
                >
                  <td className="py-4 px-6">{t(`books:${book?.code}`)}</td>
                  <td className="py-4 px-6">{Object.keys(book?.chapters)?.length} </td>
                  <td className="py-4 px-6">
                    <DownloadBlock
                      actions={{
                        compile: compileBook,
                      }}
                      state={{
                        txt: {
                          ref: { book_id: book?.id, bookCode: book?.code },
                          fileName: usfmFileNames[book?.code] || '',
                        },
                        pdf: {
                          ref: {
                            book_id: book?.id,
                            title: project.title,
                            subtitle: `${t('Book')} ${t(`books:${book?.code}`)}`,
                          },
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
