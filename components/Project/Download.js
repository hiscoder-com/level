import { useMemo, useState } from 'react'

import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { MdToZip, JsonToMd } from '@texttree/obs-format-convert-rcl'

import Breadcrumbs from 'components/Breadcrumbs'
import ListBox from 'components/ListBox'
import CheckBox from 'components/CheckBox'

import useSupabaseClient from 'utils/supabaseClient'
import { usfmFileNames } from 'utils/config'
import {
  createObjectToTransform,
  compileChapter,
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
  chapterNum,
  setIsOpenDownloading,
  bookCode,
  isBook = false,
  breadcrumbs = false,
}) {
  const supabase = useSupabaseClient()

  const { t } = useTranslation()
  const {
    query: { code },
  } = useRouter()
  const [book] = useGetBook({ code, book_code: bookCode })

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
    code,
    book_code: bookCode,
  })

  const [isSaving, setIsSaving] = useState(false)
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

  const getBookJson = async (book_id) => {
    const { data } = await supabase
      .from('chapters')
      .select('num,text')
      .eq('book_id', book_id)
      .order('num')
    return data
  }

  const downloadZip = async (downloadingBook) => {
    const obs = await getBookJson(downloadingBook.id)
    const fileData = { name: 'content', isFolder: true, content: [] }

    for (const story of obs) {
      if (!story || story.text === null) {
        continue
      }
      const text = JsonToMd(
        createObjectToTransform({
          json: story.text,
          chapterNum: story.num,
        })
      )

      if (text) {
        const chapterFile = {
          name: `${story.num}.md`,
          content: text,
        }
        fileData.content.push(chapterFile)
      }
    }

    if (downloadingBook?.properties?.obs?.back) {
      const backFile = {
        name: 'intro.md',
        content: downloadingBook.properties.obs.back,
      }
      const backFolder = {
        name: 'back',
        isFolder: true,
        content: [backFile],
      }
      fileData.content.push(backFolder)
    }

    if (downloadingBook?.properties?.obs?.intro) {
      const introFile = {
        name: 'intro.md',
        content: downloadingBook.properties.obs.intro,
      }
      const frontFolder = {
        name: 'front',
        isFolder: true,
        content: [introFile],
      }
      fileData.content.push(frontFolder)
    }

    if (downloadingBook?.properties?.obs?.title) {
      const titleFile = {
        name: 'title.md',
        content: downloadingBook.properties.obs.title,
      }
      const frontFolder = {
        name: 'front',
        isFolder: true,
        content: [titleFile],
      }
      fileData.content.push(frontFolder)
    }

    MdToZip({
      fileData,
      fileName: `${downloadingBook.properties.obs.title || 'obs'}.zip`,
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
    const chapters = await getBookJson(book?.id)
    setIsSaving(true)

    switch (downloadType) {
      case 'txt':
        downloadFile({
          text: compileChapter(
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
        await downloadPdf({
          ...(isBook ? { book } : {}),
          ...(isBook ? { chapters } : {}),
          downloadSettings,
          projectTitle: project.title,
          obs: project?.type === 'obs',
          chapter: { json: chapter?.text, chapterNum: chapter?.num },
          title: book?.properties?.scripture?.toc1 || book?.properties?.obs?.title,
          projectLanguage: project.languages.orig_name,
          fileName: `${project.title}_${
            project?.type !== 'obs'
              ? book?.properties?.scripture?.toc1 ?? t('Book')
              : book?.properties?.obs?.title ?? t('OpenBibleStories')
          }`,
          t,
        })

        break
      case 'markdown':
        downloadFile({
          text: JsonToMd(
            createObjectToTransform({
              json: chapter?.text,
              chapterNum: chapter?.num,
            })
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
          text: convertToUsfm({
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
          }),
          title: usfmFileNames[book?.code],
        })
        break
      default:
        break
    }
    setIsSaving(false)
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
      <div className="flex flex-col gap-7 text-th-secondary-10">
        <div className="text-xl font-bold">{t('Download')}</div>
        <ListBox
          options={options}
          setSelectedOption={setDownloadType}
          selectedOption={downloadType}
        />
        <div className="flex gap-7 items-end">
          <div
            className={`flex flex-col w-full space-y-4 ${
              downloadType === 'pdf' ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {Object.keys(downloadSettings)
              .filter(
                (key) =>
                  (project?.type === 'obs' || key === 'withFront') &&
                  downloadType !== 'usfm'
              )
              .map((key, index) => {
                return (
                  <CheckBox
                    key={key}
                    onChange={() =>
                      setDownloadSettings((prev) => {
                        return { ...prev, [key]: !downloadSettings[key] }
                      })
                    }
                    checked={downloadSettings[key]}
                    label={t(key)}
                  />
                )
              })}
          </div>
        </div>
        <div className="flex self-center gap-7 w-auto sm:w-3/4">
          <button
            className="btn-secondary flex-1"
            onClick={() => setIsOpenDownloading(false)}
          >
            {t('Close')}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-secondary flex-1"
          >
            {isSaving ? t('Saving') : t('Save')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Download
