import { useMemo, useState } from 'react'

import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import axios from 'axios'
import toast from 'react-hot-toast'
import JSZip from 'jszip'

import { MdToZip, JsonToMd } from '@texttree/obs-format-convert-rcl'

import { saveAs } from 'file-saver'

import Breadcrumbs from 'components/Breadcrumbs'
import ListBox from 'components/ListBox'
import CheckBox from 'components/CheckBox'
import ButtonLoading from 'components/ButtonLoading'

import useSupabaseClient from 'utils/supabaseClient'
import { newTestamentList, usfmFileNames } from 'utils/config'
import {
  createObjectToTransform,
  compileChapter,
  convertToUsfm,
  downloadFile,
  downloadPdf,
  countOfChaptersAndVerses,
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
  const isRtl = project?.is_rtl

  const { t } = useTranslation(['common', 'projects'])
  const {
    query: { code },
  } = useRouter()
  const [book] = useGetBook({ code, book_code: bookCode })

  const options = useMemo(() => {
    const options = isRtl ? [] : [{ label: 'PDF', value: 'pdf' }]
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
          extraOptions = [
            { label: 'USFM', value: 'usfm' },
            { label: t('projects:Project'), value: 'project' },
          ]
        } else {
          extraOptions = [{ label: 'TXT', value: 'txt' }]
        }
        break
    }

    return [...options, ...extraOptions]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, isBook])

  const [chapters] = useGetChapters({
    code,
    book_code: bookCode,
  })
  const defaultDownloadType = () => {
    if (!isRtl) {
      return 'pdf'
    }
    if (isBook && project?.type === 'obs') {
      return 'zip'
    }
    if (isBook && project?.type !== 'obs') {
      return 'usfm'
    }
    if (!isBook && project?.type === 'obs') {
      return 'markdown'
    }
    return 'txt'
  }
  const [isSaving, setIsSaving] = useState(false)
  const [downloadType, setDownloadType] = useState(defaultDownloadType())
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
  const createChapters = async (bookLink) => {
    if (!bookLink) return null

    const { data: jsonChapterVerse, error: errorJsonChapterVerse } =
      await countOfChaptersAndVerses({
        link: bookLink,
      })
    if (errorJsonChapterVerse) {
      return null
    }
    const chapters = {}
    for (const chapterNum in jsonChapterVerse) {
      if (Object.hasOwnProperty.call(jsonChapterVerse, chapterNum)) {
        const verses = jsonChapterVerse[chapterNum]
        const newVerses = {}
        for (let index = 1; index < verses + 1; index++) {
          newVerses[index] = { text: '', enabled: false, history: [] }
        }
        chapters[chapterNum] = newVerses
      }
    }
    return chapters
  }
  const getResourcesUrls = async (resources) => {
    if (!resources) return null
    const urls = {}
    for (const resource in resources) {
      if (Object.hasOwnProperty.call(resources, resource)) {
        const { owner, repo, commit, manifest } = resources[resource]
        const bookPath = manifest.projects.find((el) => el.identifier === bookCode)?.path
        const url = ` ${
          process.env.NEXT_PUBLIC_NODE_HOST ?? 'https://git.door43.org'
        }/${owner}/${repo}/raw/commit/${commit}/${bookPath.replace(/^\.\//, '')}`
        urls[resource] = url
      }
    }
    return urls
  }

  const addResourceName = (resources) => {
    if (!resources) return null
    const names = { tnotes: 'tNotes', twords: 'tWords', tquestions: 'tQuestions' }
    const resourceNames = Object.entries(resources).reduce((acc, [resource, value]) => {
      acc[resource] =
        names[resource] || resource.charAt(0).toUpperCase() + resource.slice(1)
      return acc
    }, {})
    return resourceNames
  }
  const getTwords = async (url) => {
    if (!url) {
      return null
    }
    try {
      const parts = url.split('/')
      const baseUrl = parts.slice(0, 3).join('/')
      const repo = parts[4].slice(0, -1)
      const owner = parts[3]
      const newUrl = `${baseUrl}/${owner}/${repo}/archive/master.zip`
      const response = await axios.get(newUrl, { responseType: 'arraybuffer' })
      const zip = new JSZip()
      await zip.loadAsync(response.data)
      const newZip = new JSZip()
      const tWordsFolder = newZip.folder('twords')
      const filePromises = []
      const regularExpression = /^[^\/]+\/bible\//
      for (const pathName in zip.files) {
        if (Object.hasOwnProperty.call(zip.files, pathName)) {
          regularExpression
          const file = zip.files[pathName]
          if (pathName.match(regularExpression)) {
            if (!file.dir) {
              const filePromise = file.async('arraybuffer').then((content) => {
                tWordsFolder.file(pathName.replace(regularExpression, ''), content)
              })
              filePromises.push(filePromise)
            }
          }
        }
      }
      await Promise.all(filePromises)
      const tWordsArrayBuffer = await newZip.generateAsync({ type: 'uint8array' })
      return Buffer.from(tWordsArrayBuffer)
    } catch (error) {
      console.error('Error fetching tWords:', error)
      return null
    }
  }
  const getOriginal = async (bookCode) => {
    if (!bookCode) {
      return null
    }
    const isGreek = Object.keys(newTestamentList).includes(bookCode)
    const newUrl = `${
      process.env.NEXT_PUBLIC_NODE_HOST ?? 'https://git.door43.org'
    }/unfoldingWord/${isGreek ? 'el-x-koine_ugnt' : 'hbo_uhb'}/raw/master/${
      usfmFileNames[bookCode]
    }`
    try {
      const response = await axios.get(newUrl)
      return response.data
    } catch (error) {
      console.error('Error fetching original USFM:', error)
      return null
    }
  }
  const createConfig = async (project, chapters) => {
    if (!chapters || !project) {
      return null
    }
    const initChapters = Object.keys(chapters).reduce((acc, chapter) => {
      acc[chapter] = 0
      return acc
    }, {})
    const methods = await axios.get('/api/methods')
    const method = methods.data.find((method) => method.title === project.method)
    if (!method?.offline_steps) {
      return null
    }
    const config = {
      steps: method.offline_steps,
      method: method.title,
      project: project.title,
      chapters: initChapters,
      book: { code: bookCode, name: bookCode },
      resources: addResourceName(project.resources),
      mainResource: project.base_manifest.resource,
    }
    return JSON.stringify(config)
  }

  const downloadResources = async (resourcesUrls, zip) => {
    for (const resource in resourcesUrls) {
      if (Object.hasOwnProperty.call(resourcesUrls, resource)) {
        const url = resourcesUrls[resource]
        try {
          const response = await axios.get(url)
          if (response.status === 200) {
            const content = response.data
            zip.file(`${resource}.${url.split('.').pop()}`, content)
          } else {
            throw new Error(`Failed to fetch resource: ${url}`)
          }
        } catch (error) {
          console.error(`Error loading: ${url}`, error)
        }
      }
    }
  }
  const addChaptersToZip = (zip, chapters) => {
    const chaptersFolder = zip.folder('chapters')
    if (chapters) {
      Object.keys(chapters).forEach((chapterNumber) => {
        const chapterData = chapters[chapterNumber]
        const chapterFileName = `${chapterNumber}.json`
        chaptersFolder.file(chapterFileName, JSON.stringify(chapterData))
      })
    }
  }
  const createProjectFiles = (zip) => {
    const files = ['personal-notes.json', 'dictionary.json', 'team-notes.json']
    const folders = ['personal-notes', 'dictionary', 'team-notes', 'chapters']

    files.forEach((filename) => {
      zip.file(filename, JSON.stringify({}))
    })

    folders.forEach((foldername) => {
      zip.folder(foldername)
    })
  }
  const createOfflineProject = async (project, bookCode) => {
    try {
      const bookLink = project.base_manifest.books.find(
        (book) => book.name === bookCode
      )?.link
      if (!bookLink) {
        throw new Error('Book link not found')
      }
      const chapters = await createChapters(bookLink)
      if (!chapters) {
        throw new Error('Chapters not created')
      }
      const zip = new JSZip()
      createProjectFiles(zip)
      const resourcesUrls = await getResourcesUrls(project.resources)
      if (!resourcesUrls) {
        throw new Error('Resource URLs not found')
      }
      await downloadResources(resourcesUrls, zip)
      const tWordsBuffer = await getTwords(resourcesUrls['twords'])
      if (!tWordsBuffer) {
        throw new Error('tWords not fetched')
      }

      zip.file('twords.zip', tWordsBuffer)

      const original = await getOriginal(bookCode)
      if (original) {
        zip.file('original.usfm', original)
      }
      addChaptersToZip(zip, chapters)
      const config = await createConfig(project, chapters)
      zip.file('config.json', config)
      return zip
    } catch (error) {
      console.error(('Error creating offline project:', error))
      return null
    }
  }
  const createAndDownloadArchive = async () => {
    try {
      const archive = await createOfflineProject(project, bookCode)
      if (!archive) {
        throw new Error('Archive not created')
      }
      const content = await archive.generateAsync({ type: 'blob' })
      saveAs(content, 'archive.zip')
    } catch (error) {
      toast.error(t('DownloadError'))
      console.error('Error downloading archive:', error)
    }
  }
  const compileBook = async ({ projectId, bookId }) => {
    try {
      const { data } = await supabase.rpc('compile_book', {
        project_id: projectId,
        book_id: bookId,
      })
      return data
    } catch (error) {
      return null
    }
  }
  const handleSave = async () => {
    let chapters = {}
    if (isBook) {
      chapters = await compileBook({ projectId: project.id, bookId: book.id })
      if (!chapters) {
        toast.error(t('DownloadError'))
        return
      }
    }
    try {
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
        case 'project':
          await createAndDownloadArchive()
          break
        default:
          break
      }
    } catch (error) {
      toast.error(t('DownloadError'))
      console.error(error)
    } finally {
      setIsSaving(false)
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

          <ButtonLoading
            onClick={handleSave}
            disabled={isSaving}
            isLoading={isSaving}
            className="relative btn-secondary flex-1"
          >
            {t('Save')}
          </ButtonLoading>
        </div>
      </div>
    </div>
  )
}

export default Download
