import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import Showdown from 'showdown'

import Modal from 'components/Modal'

import { BookCreate, ChapterList } from './index'
import { supabase } from 'utils/supabaseClient'
import {
  compileChapter,
  compilePdfObs,
  convertToUsfm,
  downloadFile,
  downloadPdf,
} from 'utils/helper'
import { usfmFileNames } from 'utils/config'
import Properties from 'public/parameters.svg'

function BookList({ highLevelAccess, project, user }) {
  const { t } = useTranslation(['common', 'books'])
  const { push, query } = useRouter()
  const [selectedBook, setSelectedBook] = useState(null)
  const [selectedBookProperties, setSelectedBookProperties] = useState(null)
  const [downloadingBook, setDownloadingBook] = useState(null)

  const [openDownloading, setOpenDownloading] = useState(false)

  const [openProperties, setOpenProperties] = useState(false)

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
        .select('id,code,chapters,properties')
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

  const compileBook = async (book, type = 'txt') => {
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
        break
      case 'pdf':
        for (const el of chapters) {
          const chapter = await compileChapter({ json: el.text }, 'html')
          if (chapter) {
            main += `<h1>${t('Chapter')} ${el.num}</h1>
          <div>${chapter ?? ''}</div>`
          }
        }
        break
      case 'pdf-obs':
        const converter = new Showdown.Converter()

        const intro = converter.makeHtml(book?.properties?.obs?.intro)
        const back = converter.makeHtml(book?.properties?.obs?.back)

        const obs = `<div>${intro}</div><div>${back}</div>`
        for (const el of chapters) {
          if (el?.text) {
            const story = await compilePdfObs({
              json: el?.text,
              project: { baseManifest: project.base_manifest },
              chapterNum: el.num,
            })
            obs += `<div>${story}</div>`
          }
        }
        return obs
        break
      default:
        break
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
                {highLevelAccess && <th className="py-3 px-6">{t('Properties')}</th>}
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
        />
      )}
      <PropertiesOfBook
        book={selectedBookProperties}
        openDownloading={openProperties}
        setOpenDownloading={setOpenProperties}
        type={project?.type}
        t={t}
      />
      <Modal
        isOpen={openDownloading}
        closeHandle={() => {
          setOpenDownloading(false)
        }}
      >
        <div className="text-center mb-4">{t('Download')}</div>
        <div
          className="p-2 hover:bg-gray-200  border-y-2 cursor-pointer"
          onClick={async (e) => {
            e.stopPropagation()
            downloadPdf({
              htmlContent: await compileBook(
                downloadingBook,
                project?.type === 'obs' ? 'pdf-obs' : 'pdf'
              ),
              title: project?.title,
              subTitle: `${
                project?.type !== 'obs'
                  ? downloadingBook?.properties?.scripture?.toc1 ?? 'Book'
                  : downloadingBook?.properties?.obs?.title ?? 'Open bible stories'
              } `,
              projectLanguage: {
                code: project.languages.code,
                title: project.languages.orig_name,
              },
            })
          }}
        >
          {t('ExportToPDF')}
        </div>
        <div
          className="p-2 hover:bg-gray-200  border-b-2 cursor-pointer"
          onClick={async (e) => {
            e.stopPropagation()
            project?.type === 'obs'
              ? downloadFile({
                  text: await compileChapter(
                    {
                      json: currentChapter?.text,
                      chapterNum: currentChapter?.num,
                      project: {
                        baseManifest: project?.base_manifest,
                      },
                    },
                    'markdown'
                  ),
                  title: `${currentChapter?.num}.md`,
                  type: 'markdown/plain',
                })
              : downloadFile({
                  text: await compileBook(downloadingBook),
                  title: usfmFileNames[downloadingBook?.code],
                })
          }}
        >
          {project?.type === 'obs' ? t('ExportToZIP') : 'ExportToUSFM'}
        </div>

        <div className="flex justify-end">
          <button
            className="btn-cyan mt-2"
            onClick={() => {
              setOpenDownloading(false)
            }}
          >
            {t('common:Close')}
          </button>
        </div>
      </Modal>
    </>
  )
}
export default BookList

function PropertiesOfBook({ book, openDownloading, setOpenDownloading, t, type }) {
  const properties =
    book?.properties &&
    Object.entries(
      type !== 'obs' ? book?.properties?.scripture : book?.properties?.obs
    )?.map((el, index) => {
      return (
        <div key={index}>
          <div>{el[0]}</div>
          <textarea className="input" defaultValue={el[1]} />
        </div>
      )
    })
  return (
    <div>
      <Modal
        isOpen={openDownloading}
        closeHandle={() => {
          setOpenDownloading(false)
        }}
      >
        {properties}
        <div className="flex justify-end">
          <button
            className="btn-cyan "
            onClick={() => {
              setOpenDownloading(false)
            }}
          >
            {t('common:Close')}
          </button>
        </div>
      </Modal>
    </div>
  )
}
