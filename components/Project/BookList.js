import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import Showdown from 'showdown'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

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
import Properties from 'public/parameters.svg'
import PropertiesOfBook from './PropertiesOfBook'
import { usfmFileNames } from 'utils/config'

function BookList({ highLevelAccess, project, user }) {
  const { t } = useTranslation(['common', 'books'])
  const { push, query } = useRouter()
  const [selectedBook, setSelectedBook] = useState(null)
  const [selectedBookProperties, setSelectedBookProperties] = useState(null)
  const [downloadingBook, setDownloadingBook] = useState(null)

  const [openDownloading, setOpenDownloading] = useState(false)

  const [openProperties, setOpenProperties] = useState(false)
  const [updatingBooks, setUpdatingBooks] = useState(false)
  const [downloadSettings, setDownloadSettings] = useState({
    WithImages: true,
    WithFront: true,
    WithIntro: true,
    WithBack: true,
  })

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

    if (project?.id && !updatingBooks) {
      getBooks()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id, query?.book, updatingBooks])

  useEffect(() => {
    if (query?.book && books?.length) {
      const book = books?.find((book) => book.code === query?.book)
      setSelectedBook(book)
    } else {
      setSelectedBook(null)
    }
  }, [query, books])

  const compileBook = async (book, type = 'txt', downloadSettings) => {
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
        break
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
        break
      case 'pdf-obs':
        const converter = new Showdown.Converter()
        const front = `<div style="text-align: center"><h1>${project?.title}</h1><h1>${book?.properties?.obs?.title}</h1></div>`
        const intro = converter.makeHtml(book?.properties?.obs?.intro)
        const back = converter.makeHtml(book?.properties?.obs?.back)

        const obs = `${downloadSettings?.WithFront ? front : ''}${
          downloadSettings?.WithIntro ? `<div>${intro}</div>` : ''
        }${downloadSettings?.WithBack ? `<div>${back}</div>` : ''}`
        for (const el of chapters) {
          if (el?.text) {
            const story = await compilePdfObs(
              {
                json: el?.text,
                project: { baseManifest: project.base_manifest },
                chapterNum: el.num,
              },
              downloadSettings
            )
            if (story) {
              obs += `<div>${story}</div>`
            }
          }
        }
        return obs

      default:
        break
    }
  }
  const downloadZip = async (downloadingBook) => {
    var zip = new JSZip()
    const obs = await getBookJson(downloadingBook.id)
    for (const story of obs) {
      const text = await compileChapter(
        {
          json: story?.text,
          chapterNum: story?.num,
          project: {
            baseManifest: project?.base_manifest,
          },
        },
        'markdown'
      )
      zip.folder('content').file(story?.num + '.md', text)
    }
    zip
      .folder('content')
      .folder('back')
      .file('intro.md', downloadingBook?.properties?.obs?.back)
    zip
      .folder('content')
      .folder('front')
      .file('intro.md', downloadingBook?.properties?.obs?.intro)
      .file('title.md', downloadingBook?.properties?.obs?.title)

    zip.generateAsync({ type: 'blob' }).then(function (blob) {
      saveAs(blob, `${downloadingBook?.properties?.obs?.title || 'obs'}.zip`)
    })
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
          token={user?.access_token}
        />
      )}
      <PropertiesOfBook
        projectId={project?.id}
        setUpdatingBooks={setUpdatingBooks}
        user={user}
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
                project?.type === 'obs' ? 'pdf-obs' : 'pdf',
                downloadSettings
              ),
              projectLanguage: {
                code: project.languages.code,
                title: project.languages.orig_name,
              },
              downloadSettings,
              fileName: `${project.title}_${
                project?.type !== 'obs'
                  ? downloadingBook?.properties?.scripture?.toc1 ?? 'Book'
                  : downloadingBook?.properties?.obs?.title ?? 'Open bible stories'
              }`,
            })
          }}
        >
          {t('ExportToPdf')}
        </div>
        {project?.type === 'obs' ? (
          <div
            onClick={() => downloadZip(downloadingBook)}
            className="p-2 hover:bg-gray-200  border-b-2 cursor-pointer"
          >
            {t('ExportToZip')}
          </div>
        ) : (
          <div
            className="p-2 hover:bg-gray-200  border-b-2 cursor-pointer"
            onClick={async (e) => {
              e.stopPropagation()
              downloadFile({
                text: await compileBook(downloadingBook, 'txt', downloadSettings),
                title: usfmFileNames[downloadingBook?.code],
              })
            }}
          >
            {t('ExportToUsfm')}
          </div>
        )}
        {Object.keys(downloadSettings)
          .filter((el) => project?.type === 'obs' || el === 'WithFront')
          .map((el, index) => {
            // const [label, value] = el
            return (
              <div key={index}>
                <input
                  className="mt-4 h-[17px] w-[17px] cursor-pointer accent-cyan-600"
                  type="checkbox"
                  checked={downloadSettings[el]}
                  onChange={() =>
                    setDownloadSettings((prev) => {
                      return { ...prev, [el]: !downloadSettings[el] }
                    })
                  }
                />
                <span className="ml-2">{t(el)}</span>
              </div>
            )
          })}
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
