import { useMemo, useState } from 'react'

import JSZip from 'jszip'

import { saveAs } from 'file-saver'
import { supabase } from 'utils/supabaseClient'

import { usfmFileNames } from 'utils/config'
import {
  compileChapter,
  compilePdfObs,
  convertToUsfm,
  downloadFile,
  downloadPdf,
} from 'utils/helper'
import { useTranslation } from 'next-i18next'
import BreadCrumb from 'components/ProjectEdit/BreadCrumb'
import Showdown from 'showdown'

const downloadSettingsChapter = {
  withImages: true,
  withFront: true,
}
const downloadSettingsBook = {
  ...downloadSettingsChapter,
  withIntro: true,
  withBack: true,
}

function Download({
  // compileBook,
  project,
  // getBookJson,
  isBook = false,
  chapter,
  bookCode,
  books,
}) {
  console.log(chapter)
  const { t } = useTranslation()
  const [downloadSettings, setDownloadSettings] = useState(
    isBook ? downloadSettingsBook : downloadSettingsChapter
  )
  const book = useMemo(() => books?.find((el) => el.code === bookCode), [bookCode, books])

  const compileBook = async (book, type = 'txt', downloadSettings) => {
    const chapters = await getBookJson(book?.id)
    console.log(book?.id)
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

  const getBookJson = async (book_id) => {
    const { data } = await supabase
      .from('chapters')
      .select('num,text')
      .eq('book_id', book_id)
      .order('num')
    return data
  }

  const downloadZip = async (downloadingBook) => {
    const zip = new JSZip()
    const obs = await getBookJson(downloadingBook.id)
    for (const story of obs) {
      const text = await compileChapter(
        {
          json: story?.text,
          chapterNum: story?.num,
        },
        'markdown'
      )
      if (text) {
        zip.folder('content').file(story?.num + '.md', text)
      }
    }
    if (downloadingBook?.properties?.obs?.back) {
      zip
        .folder('content')
        .folder('back')
        .file('intro.md', downloadingBook?.properties?.obs?.back)
    }
    if (downloadingBook?.properties?.obs?.intro) {
      zip
        .folder('content')
        .folder('front')
        .file('intro.md', downloadingBook?.properties?.obs?.intro)
    }
    if (downloadingBook?.properties?.obs?.title) {
      zip
        .folder('content')
        .folder('front')
        .file('title.md', downloadingBook?.properties?.obs?.title)
    }

    zip.generateAsync({ type: 'blob' }).then(function (blob) {
      saveAs(blob, `${downloadingBook?.properties?.obs?.title || 'obs'}.zip`)
    })
  }
  const links = [
    { title: project?.title, href: '/projects/' + project?.code },
    {
      title: t('books:' + bookCode),
      href: '/projects/' + project?.code + '?book=' + bookCode,
    },
  ]
  return (
    <div className="w-full">
      <BreadCrumb
        links={isBook ? links.filter((el) => isBook && !el.href.includes('book')) : links}
      />
      <div className="flex h4 m-4 ">{t('Download')}</div>
      <div className="flex">
        <div className="pb-2 border-b-2">
          {isBook ? (
            <BookDownloadPdf
              downloadingBook={book}
              downloadSettings={downloadSettings}
              project={project}
              t={t}
              compileBook={compileBook}
            />
          ) : (
            <ChapterDownloadPdf
              selectedBook={book}
              chapter={chapter}
              project={project}
              downloadSettings={downloadSettings}
              t={t}
            />
          )}
          {Object.keys(downloadSettings)
            .filter((key) => project?.type === 'obs' || key === 'withFront')
            .map((key, index) => {
              return (
                <div key={index}>
                  <input
                    className="h-[17px] w-[17px] mt-4 cursor-pointer accent-cyan-600"
                    type="checkbox"
                    checked={downloadSettings[key]}
                    onChange={() =>
                      setDownloadSettings((prev) => {
                        return { ...prev, [key]: !downloadSettings[key] }
                      })
                    }
                  />
                  <span className="ml-2">{t(key)}</span>
                </div>
              )
            })}
        </div>
      </div>
      {isBook ? (
        <BookDownloadUsfmZip
          downloadZip={downloadZip}
          downloadingBook={book}
          downloadSettings={downloadSettings}
          t={t}
          compileBook={compileBook}
          project={project}
        />
      ) : (
        <ChapterDownloadTxtMd
          project={project}
          chapter={chapter}
          selectedBook={book}
          t={t}
        />
      )}
    </div>
  )
}

export default Download

function BookDownloadPdf({ downloadingBook, downloadSettings, project, t, compileBook }) {
  return (
    <div
      className="btn p-2 hover:bg-gray-200 border-y-2 cursor-pointer"
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
          fileName: `${project.title}_${
            project?.type !== 'obs'
              ? downloadingBook?.properties?.scripture?.toc1 ?? t('Book')
              : downloadingBook?.properties?.obs?.title ?? t('OpenBibleStories')
          }`,
        })
      }}
    >
      {t('ExportToPdf')}
    </div>
  )
}

function BookDownloadUsfmZip({
  downloadZip,
  downloadingBook,
  downloadSettings,
  t,
  compileBook,
  project,
}) {
  return (
    <>
      {project?.type === 'obs' ? (
        <div
          onClick={() => downloadZip(downloadingBook)}
          className="btn p-2 mt-4 hover:bg-gray-200 cursor-pointer"
        >
          {t('ExportToZip')}
        </div>
      ) : (
        <div
          className="btn p-2 mt-4 hover:bg-gray-200 cursor-pointer"
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
    </>
  )
}

function ChapterDownloadPdf({ selectedBook, chapter, project, downloadSettings, t }) {
  return (
    <div
      className="btn p-2 hover:bg-gray-200 border-y-2 cursor-pointer"
      onClick={async (e) => {
        downloadPdf({
          htmlContent: await compileChapter(
            {
              json: chapter?.text,
              chapterNum: chapter?.num,
              project: {
                title: project.title,
              },
              book: selectedBook,
            },
            project?.type === 'obs' ? 'pdf-obs' : 'pdf',
            downloadSettings
          ),
          projectLanguage: {
            code: project.languages.code,
            title: project.languages.orig_name,
          },
          fileName: `${project.title}_${
            project?.type !== 'obs'
              ? selectedBook?.properties?.scripture?.toc1 ?? t('Book')
              : selectedBook?.properties?.obs?.title ?? t('OpenBibleStories')
          }`,
        })
      }}
    >
      {t('ExportToPdf')}
    </div>
  )
}

function ChapterDownloadTxtMd({ project, chapter, selectedBook, t }) {
  return (
    <div
      className="btn p-2 mt-4 hover:bg-gray-200 cursor-pointer"
      onClick={async (e) => {
        project?.type === 'obs'
          ? downloadFile({
              text: await compileChapter(
                {
                  json: chapter?.text,
                  chapterNum: chapter?.num,
                },
                'markdown'
              ),
              title: `${String(chapter?.num).padStart(2, '0')}.md`,
              type: 'markdown/plain',
            })
          : downloadFile({
              text: await compileChapter(
                {
                  json: chapter?.text,
                  title: `${project?.title}\n${selectedBook?.properties.scripture.toc1}\n${selectedBook?.properties.scripture.chapter_label} ${chapter?.num}`,
                  subtitle: `${t(`books:${selectedBook?.code}`)} ${t('Chapter')} ${
                    chapter?.num
                  }`,
                  chapterNum: chapter?.num,
                },
                'txt'
              ),
              title: `${project?.title}_${selectedBook?.properties.scripture.toc1}_chapter_${chapter?.num}.txt`,
            })
      }}
    >
      {project?.type === 'obs' ? t('ExportToMd') : t('ExportToTxt')}
    </div>
  )
}
