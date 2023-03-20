import { useState } from 'react'

import JSZip from 'jszip'

import { saveAs } from 'file-saver'

import Modal from 'components/Modal'

import { usfmFileNames } from 'utils/config'
import { compileChapter, downloadFile, downloadPdf } from 'utils/helper'

const downloadSettingsChapter = {
  WithImages: true,
  WithFront: true,
}
const downloadSettingsBook = {
  ...downloadSettingsChapter,
  WithIntro: true,
  WithBack: true,
}

function Download({
  openDownloading,
  setOpenDownloading,
  compileBook,
  downloadingBook,
  project,
  t,
  getBookJson,
  isBook = false,
  currentChapter,
}) {
  const [downloadSettings, setDownloadSettings] = useState(
    isBook ? downloadSettingsBook : downloadSettingsChapter
  )

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

  return (
    <Modal isOpen={openDownloading} closeHandle={() => setOpenDownloading(false)}>
      <div className="mb-4 text-center">{t('Download')}</div>
      <div className="pb-2 border-b-2">
        {isBook ? (
          <BookDownloadPdf
            downloadingBook={downloadingBook}
            downloadSettings={downloadSettings}
            project={project}
            t={t}
            compileBook={compileBook}
          />
        ) : (
          <ChapterDownloadPdf
            selectedBook={downloadingBook}
            currentChapter={currentChapter}
            project={project}
            downloadSettings={downloadSettings}
            t={t}
          />
        )}
        {Object.keys(downloadSettings)
          .filter((key) => project?.type === 'obs' || key === 'WithFront')
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
      {isBook ? (
        <BookDownloadUsfmZip
          downloadZip={downloadZip}
          downloadingBook={downloadingBook}
          downloadSettings={downloadSettings}
          t={t}
          compileBook={compileBook}
          project={project}
        />
      ) : (
        <ChapterDownloadTxtMd
          project={project}
          currentChapter={currentChapter}
          selectedBook={downloadingBook}
          t={t}
        />
      )}
      <div className="flex justify-end">
        <button
          className="btn-cyan mt-2"
          onClick={() => {
            setOpenDownloading(false)
          }}
        >
          {t('Close')}
        </button>
      </div>
    </Modal>
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

function ChapterDownloadPdf({
  selectedBook,
  currentChapter,
  project,
  downloadSettings,
  t,
}) {
  return (
    <div
      className="btn p-2 hover:bg-gray-200 border-y-2 cursor-pointer"
      onClick={async (e) => {
        downloadPdf({
          htmlContent: await compileChapter(
            {
              json: currentChapter?.text,
              chapterNum: currentChapter?.num,
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

function ChapterDownloadTxtMd({ project, currentChapter, selectedBook, t }) {
  return (
    <div
      className="btn p-2 mt-4 hover:bg-gray-200 cursor-pointer"
      onClick={async (e) => {
        project?.type === 'obs'
          ? downloadFile({
              text: await compileChapter(
                {
                  json: currentChapter?.text,
                  chapterNum: currentChapter?.num,
                },
                'markdown'
              ),
              title: `${String(currentChapter?.num).padStart(2, '0')}.md`,
              type: 'markdown/plain',
            })
          : downloadFile({
              text: await compileChapter(
                {
                  json: currentChapter?.text,
                  title: `${project?.title}\n${selectedBook?.properties.scripture.toc1}\n${selectedBook?.properties.scripture.chapter_label} ${currentChapter?.num}`,
                  subtitle: `${t(`books:${selectedBook?.code}`)} ${t('Chapter')} ${
                    currentChapter?.num
                  }`,
                  chapterNum: currentChapter?.num,
                },
                'txt'
              ),
              title: `${project?.title}_${selectedBook?.properties.scripture.toc1}_chapter_${currentChapter?.num}.txt`,
            })
      }}
    >
      {project?.type === 'obs' ? t('ExportToMd') : t('ExportToTxt')}
    </div>
  )
}
