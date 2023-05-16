import { useMemo, useState } from 'react'
import { useRouter } from 'next/router'

import JSZip from 'jszip'

import { useTranslation } from 'next-i18next'

import { saveAs } from 'file-saver'

import { supabase } from 'utils/supabaseClient'

import Showdown from 'showdown'

import Breadcrumbs from 'components/Breadcrumbs'
import ListBox from 'components/ListBox'

import { usfmFileNames } from 'utils/config'
import {
  compileChapter,
  compilePdfObs,
  convertToUsfm,
  downloadFile,
  downloadPdf,
} from 'utils/helper'
import { useGetBook, useGetChapters } from 'utils/hooks'

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
  project,
  user,
  chapterNum,
  setIsOpenDownloading,
  bookCode,
  isBook = false,
  breadcrumbs = false,
}) {
  const { t } = useTranslation()
  const {
    query: { code },
  } = useRouter()
  const [book] = useGetBook({ token: user?.access_token, code, book_code: bookCode })

  const options = useMemo(() => {
    const options = [{ label: 'PDF', value: 'pdf' }]
    let extraOptions = []

    switch (project?.type) {
      case 'obs':
        if (isBook) {
          extraOptions = [{ label: 'ZIP', value: 'zip' }]
        } else {
          extraOptions = [{ label: 'Markdown', value: 'markdown' }]
        }
        break
      default:
        if (isBook) {
          extraOptions = [{ label: 'USFM', value: 'usfm' }]
        } else {
          extraOptions = [{ label: 'TXT', value: 'txt' }]
        }
        break
    }

    return [...options, ...extraOptions]
  }, [project, isBook])

  const [chapters] = useGetChapters({
    token: user?.access_token,
    code,
    book_code: bookCode,
  })

  const [downloadType, setDownloadType] = useState('pdf')
  const [downloadSettings, setDownloadSettings] = useState(
    isBook ? downloadSettingsBook : downloadSettingsChapter
  )

  const chapter = useMemo(
    () =>
      chapterNum &&
      chapters?.find((chapter) => chapter.num.toString() === chapterNum.toString()),
    [chapters, chapterNum]
  )
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
        let main = ''
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
    {
      title: !isBook
        ? t('Chapter') + ' ' + (chapter?.num || '...')
        : t('books:' + bookCode),
    },
  ]
  const handleSave = async () => {
    switch (downloadType) {
      case 'txt':
        downloadFile({
          text: await compileChapter(
            {
              json: chapter?.text,
              title: `${project?.title}\n${book?.properties.scripture.toc1}\n${book?.properties.scripture.chapter_label} ${chapterNum}`,
              subtitle: `${t(`books:${book?.code}`)} ${t('Chapter')} ${chapterNum}`,
              chapterNum,
            },
            'txt'
          ),
          title: `${project?.title}_${book?.properties.scripture.toc1}_chapter_${chapterNum}.txt`,
        })
        break
      case 'pdf':
        isBook
          ? downloadPdf({
              htmlContent: await compileBook(
                book,
                project?.type === 'obs' ? 'pdf-obs' : 'pdf',
                downloadSettings
              ),
              projectLanguage: {
                code: project.languages.code,
                title: project.languages.orig_name,
              },
              fileName: `${project.title}_${
                project?.type !== 'obs'
                  ? book?.properties?.scripture?.toc1 ?? t('Book')
                  : book?.properties?.obs?.title ?? t('OpenBibleStories')
              }`,
            })
          : downloadPdf({
              htmlContent: await compileChapter(
                {
                  json: chapter?.text,
                  chapterNum,
                  project: {
                    title: project.title,
                  },
                  book,
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
                  ? book?.properties?.scripture?.toc1 ?? t('Book')
                  : book?.properties?.obs?.title ?? t('OpenBibleStories')
              }`,
            })
        break
      case 'markdown':
        downloadFile({
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
        break
      case 'zip':
        downloadZip(book)
        break
      case 'usfm':
        downloadFile({
          text: await compileBook(book, 'txt', downloadSettings),
          title: usfmFileNames[book?.code],
        })
        break
      default:
        break
    }
  }
  return (
    <div className="flex flex-col gap-7">
      {breadcrumbs && (
        <Breadcrumbs
          links={
            isBook
              ? links.filter((link) => isBook && !link?.href?.includes('book'))
              : links
          }
        />
      )}
      <div className="flex flex-col gap-7 text-white">
        <div className="text-xl font-bold">{t('Download')}</div>
        <ListBox
          options={options}
          setSelectedOption={setDownloadType}
          selectedOption={downloadType}
        />
        <div className="flex gap-7 items-end">
          <div className="flex flex-col gap-6 w-full">
            {Object.keys(downloadSettings)
              .filter((key) => project?.type === 'obs' || key === 'withFront')
              .map((key, index) => {
                return (
                  <div key={index} className="flex justify-between items-center gap-2">
                    <label htmlFor={t(key)}>{t(key)}</label>
                    <input
                      id={t(key)}
                      className="h-7 w-7 cursor-pointer accent-teal-600"
                      type="checkbox"
                      checked={downloadSettings[key]}
                      onChange={() =>
                        setDownloadSettings((prev) => {
                          return { ...prev, [key]: !downloadSettings[key] }
                        })
                      }
                    />
                  </div>
                )
              })}
          </div>
        </div>
        <div className="grid grid-cols-2 auto-cols-fr justify-center self-center gap-7">
          <button className="btn-secondary" onClick={() => setIsOpenDownloading(false)}>
            {t('Close')}
          </button>
          <button onClick={handleSave} className="btn-secondary">
            {t('Save')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Download
