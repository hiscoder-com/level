import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import Showdown from 'showdown'

import { BookCreate, ChapterList, PropertiesOfBook, Download } from './index'

import { supabase } from 'utils/supabaseClient'
import { compileChapter, compilePdfObs, convertToUsfm } from 'utils/helper'
import { useGetBooks } from 'utils/hooks'

import Properties from 'public/gear.svg'

function BookList({ highLevelAccess, project, user }) {
  const { t } = useTranslation(['common', 'books'])
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

  const compileBook = async (book, type = 'txt', downloadSettings) => {
    const chapters = await getBookJson(book?.id)
    if (chapters?.length === 0) {
      return
    }

    switch (type) {
      case 'txt':
        return convertToUsfm({
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
      case 'pdf':
        const frontPdf = downloadSettings?.withFront
          ? `<div class="break" style="text-align: center"><h1>${project?.title}</h1><h1>${book?.properties?.scripture?.toc1}</h1></div>`
          : ''
        const main = ''
        for (const el of chapters) {
          const chapter = await compileChapter(
            { json: el.text, chapterNum: el.num, book },
            'html'
          )
          if (chapter) {
            main += `<div>${chapter ?? ''}</div>`
          }
        }
        return frontPdf + main
      case 'pdf-obs':
        const converter = new Showdown.Converter()
        let obs = ''
        for (const el of chapters) {
          if (el?.text) {
            const story = await compilePdfObs(
              {
                json: el?.text,
                chapterNum: el.num,
              },
              downloadSettings
            )
            if (story) {
              obs += `<div class="break">${story}</div>`
            }
          }
        }
        if (!book?.properties?.obs) {
          return obs
        }
        const { title: _title, intro: _intro, back: _back } = book.properties.obs
        const title = _title ? `<h1>${_title}</h1>` : ''
        const front = downloadSettings?.withFront
          ? `<div class="break" style="text-align: center"><h1>${project?.title}</h1>${title}</div>`
          : ''
        const intro =
          _intro && downloadSettings?.withIntro
            ? `<div class="break" >${converter.makeHtml(_intro)}</div>`
            : ''
        const back =
          _back && downloadSettings?.withBack
            ? `<div>${converter.makeHtml(_back)}</div>`
            : ''
        return front + intro + obs + back
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
                      className="p-2 text-blue-600 hover:text-gray-400"
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
                        className="w-12 p-2 hover:bg-gray-200"
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
