import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import Showdown from 'showdown'

import { BookCreate, ChapterList, PropertiesOfBook, Download } from './index'
import { supabase } from 'utils/supabaseClient'
import { compileChapter, compilePdfObs, convertToUsfm } from 'utils/helper'
import Properties from 'public/parameters.svg'

import { useGetBooks } from 'utils/hooks'

function BookList({ highLevelAccess, project, user }) {
  const { t } = useTranslation(['common', 'books', 'book-properties'])
  const { push, query } = useRouter()
  const [selectedBook, setSelectedBook] = useState(null)
  const [selectedBookProperties, setSelectedBookProperties] = useState(null)
  const [downloadingBook, setDownloadingBook] = useState(null)

  const [openDownloading, setOpenDownloading] = useState(false)

  const [openProperties, setOpenProperties] = useState(false)

  const [books, { mutate: mutateBooks }] = useGetBooks({
    token: user?.access_token,
    code: project?.code,
  })

  useEffect(() => {
    if (query?.book && books?.length) {
      const book = books?.find((book) => book.code === query?.book)
      setSelectedBook(book)
    } else {
      setSelectedBook(null)
    }
  }, [query, books])
  const getBookJson = async (book_id) => {
    const { data } = await supabase
      .from('chapters')
      .select('num,text')
      .eq('book_id', book_id)
      .order('num')
    return data
  }

  const compileBook = async (book, type = 'txt', downloadSettings, imageSetting) => {
    const chapters = await getBookJson(book?.id)

    let main = ''
    if (chapters?.length === 0) {
      return
    }

    switch (type) {
      case 'txt':
        main = convertToUsfm({
          jsonChapters: chapters,
          book,
          project: {
            code: project?.code,
            title: project?.title,
            language: {
              code: project?.languages?.code,
              orig_name: project?.languages?.orig_name,
            },
          },
        })
        return main
      case 'pdf':
        if (downloadSettings?.WithFront) {
          main += `<div style="text-align: center"><h1>${project?.title}</h1><h1>${book?.properties?.scripture?.toc1}</h1></div>`
        }
        for (const el of chapters) {
          const chapter = await compileChapter(
            { json: el.text, chapterNum: el.num, book },
            'html'
          )
          if (chapter) {
            main += `<div>${chapter ?? ''}</div>`
          }
        }
        return main
      case 'pdf-obs':
        const converter = new Showdown.Converter()

        const title = book?.properties?.obs?.title
          ? `<h1>${book?.properties?.obs?.title}</h1>`
          : ''
        const front = `<div style="text-align: center"><h1>${project?.title}</h1>${title}</div>`
        const intro = book?.properties?.obs?.intro
          ? converter.makeHtml(book?.properties?.obs?.intro)
          : ''
        const back = book?.properties?.obs?.back
          ? converter.makeHtml(book?.properties?.obs?.back)
          : ''
        const obs = `${downloadSettings?.WithFront ? front : ''}${
          downloadSettings?.WithIntro ? `<div>${intro}</div>` : ''
        }`
        for (const el of chapters) {
          if (el?.text) {
            const story = await compilePdfObs(
              {
                json: el?.text,
                chapterNum: el.num,
              },
              imageSetting
            )
            if (story) {
              obs += `<div>${story}</div>`
            }
          }
        }
        if (downloadSettings?.WithBack) {
          obs += `<div>${back}</div>`
        }
        return obs
      default:
        break
    }
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
                {highLevelAccess && <th className="py-3 px-6">{t('Properties')}</th>}
              </tr>
            </thead>
            <tbody>
              {books?.map((book, index) => (
                <tr
                  key={index}
                  onClick={() =>
                    push({
                      pathname: `/projects/${project?.code}`,
                      query: { book: book?.code },
                      shallow: true,
                    })
                  }
                  className="cursor-pointer hover:bg-gray-50 bg-white border-b"
                >
                  <td className="py-4 px-6">{t(`books:${book?.code}`)}</td>
                  <td className="py-4 px-6">{Object.keys(book?.chapters)?.length} </td>
                  <td className="py-4 px-6">
                    <button
                      className="text-blue-600 hover:text-gray-400 p-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenDownloading(true)
                        setDownloadingBook(book)
                      }}
                    >
                      {t('Download')}
                    </button>
                  </td>
                  {highLevelAccess && (
                    <td className="py-6 px-6">
                      <button
                        className="p-2 hover:bg-gray-200 w-12"
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenProperties(true)
                          setSelectedBookProperties(book)
                        }}
                      >
                        <Properties />
                      </button>
                    </td>
                  )}
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
          token={user?.access_token}
        />
      )}
      <PropertiesOfBook
        projectId={project?.id}
        user={user}
        book={selectedBookProperties}
        openDownloading={openProperties}
        setOpenDownloading={setOpenProperties}
        type={project?.type}
        t={t}
        mutateBooks={mutateBooks}
      />
      <Download
        openDownloading={openDownloading}
        setOpenDownloading={setOpenDownloading}
        compileBook={compileBook}
        downloadingBook={downloadingBook}
        project={project}
        t={t}
        getBookJson={getBookJson}
        isBook
      />
    </>
  )
}
export default BookList
