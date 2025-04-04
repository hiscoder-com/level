import { useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import axios from 'axios'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import { useTranslation } from 'next-i18next'
import toast from 'react-hot-toast'

import { JsonToMd, MdToZip } from '@texttree/obs-format-convert-rcl'

import Breadcrumbs from 'components/Breadcrumbs'
import ButtonLoading from 'components/ButtonLoading'
import CheckBox from 'components/CheckBox'
import ListBox from 'components/ListBox'

import { newTestamentList, obsStoryVerses, usfmFileNames } from 'utils/config'
import {
  compileChapter,
  convertToUsfm,
  createObjectToTransform,
  downloadFile,
  downloadPdf,
  getCountChaptersAndVerses,
} from 'utils/helper'
import { useGetBook, useGetChapters } from 'utils/hooks'
import useSupabaseClient from 'utils/supabaseClient'

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

  const { t } = useTranslation(['common', 'projects', 'books'])
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
          extraOptions = [
            { label: 'ZIP', value: 'zip' },
            { label: t('projects:Project'), value: 'project' },
          ]
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
  const createChapters = async (bookLink, typeProject) => {
    if (!bookLink) return null
    let chapterVerse = {}
    if (typeProject === 'obs') {
      chapterVerse = obsStoryVerses
    } else {
      const { data: jsonChapterVerse, error: errorJsonChapterVerse } =
        await getCountChaptersAndVerses({
          link: bookLink,
        })
      chapterVerse = jsonChapterVerse
      if (errorJsonChapterVerse) {
        return null
      }
    }
    const chapters = {}
    for (const chapterNum in chapterVerse) {
      if (Object.hasOwnProperty.call(chapterVerse, chapterNum)) {
        const verses = chapterVerse[chapterNum]
        const newVerses = {}

        if (typeProject === 'obs') {
          newVerses[0] = { text: '', enabled: false, history: [] }
        }

        for (let index = 1; index < verses + 1; index++) {
          newVerses[index] = { text: '', enabled: false, history: [] }
        }

        if (typeProject === 'obs') {
          newVerses[200] = { text: '', enabled: false, history: [] }
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
        //TODO- продумать другое решение
        if (resource === 'tAcademy') {
          continue
        }
        if (resource === 'obs') {
          const { owner, repo } = resources[resource]
          const url = ` ${
            process.env.NEXT_PUBLIC_NODE_HOST ?? 'https://git.door43.org'
          }/${owner}/${repo}/archive/master.zip`
          urls[resource] = url
          continue
        }
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
      acc[resource] = {
        name: names[resource] || resource.charAt(0).toUpperCase() + resource.slice(1),
        title: value?.manifest?.dublin_core?.title || '',
      }
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
      const repo = parts[4].split('_')[0] + '_tw'
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

    const sortedChapters = Object.fromEntries(
      Object.entries(chapters)
        .map(([key, value]) => [parseInt(key, 10), value])
        .sort(([a], [b]) => a - b)
    )
    const initChapters = Object.keys(sortedChapters).reduce((acc, chapter) => {
      acc[chapter] = 0
      return acc
    }, {})
    const methods = await axios.get('/api/methods')
    const method = methods.data.find((method) => method.title === project.method)
    if (!method?.offline_steps) {
      return null
    }
    const bookName =
      book.properties.scripture.toc2 || t('books:' + bookCode, { lng: 'en' })
    const config = {
      steps: method.offline_steps,
      method: method.title,
      project: { code: project.code, title: project.title },
      chapters: initChapters,
      book: { code: bookCode, name: bookName },
      resources: addResourceName(project.resources),
      mainResource: project.base_manifest.resource,
      typeProject: project.type,
      language: { is_rtl: project.is_rtl },
    }
    return JSON.stringify(config)
  }

  const downloadResources = async (resourcesUrls, zip, typeProject) => {
    for (const resource in resourcesUrls) {
      if (!Object.hasOwnProperty.call(resourcesUrls, resource)) continue

      const url = resourcesUrls[resource]
      try {
        if (resource === 'obs') {
          const response = await axios.get(url, { responseType: 'arraybuffer' })
          if (response.status !== 200)
            throw new Error(`Failed to fetch OBS archive: ${url}`)

          const obsZip = await JSZip.loadAsync(response.data)

          const rootFolder = Object.keys(obsZip.files).find(
            (path) => obsZip.files[path].dir
          )
          if (!rootFolder) throw new Error('No root folder found in OBS archive')

          const newObsZip = new JSZip()
          for (const filePath of Object.keys(obsZip.files)) {
            const file = obsZip.files[filePath]
            if (file.dir || !filePath.startsWith(rootFolder)) continue

            const newPath = filePath.slice(rootFolder.length)
            const content = await file.async('nodebuffer')
            newObsZip.file(newPath, content)
          }

          const newObsZipContent = await newObsZip.generateAsync({ type: 'nodebuffer' })
          zip.file('obs.zip', newObsZipContent)

          const { data: obsImagesUrl } = await getOBSImages()
          if (!obsImagesUrl) throw new Error('OBS images URL is not defined')
          const responseObsImages = await axios.get(obsImagesUrl, {
            responseType: 'arraybuffer',
          })

          if (responseObsImages.status !== 200)
            throw new Error(`Failed to fetch OBS images from storage: ${obsImagesUrl}`)

          const obsImagesZip = await JSZip.loadAsync(responseObsImages.data)

          const obsImagesZipContent = await obsImagesZip.generateAsync({
            type: 'nodebuffer',
          })
          zip.file('obs-images-360px.zip', obsImagesZipContent)
        } else {
          const response = await axios.get(url)
          if (response.status === 200) {
            const content = response.data
            zip.file(`${resource}.${url.split('.').pop()}`, content)
          } else {
            throw new Error(`Failed to fetch resource: ${url}`)
          }
        }
      } catch (error) {
        console.error(`Error loading ${url}:`, error)
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
  const getOBSImages = async () => {
    try {
      const response = await axios.get(`/api/obs-images`)

      if (response.status === 200) {
        const content = response.data
        return content
      } else {
        throw new Error(`Failed to fetch resource: ${url}`)
      }
    } catch (error) {
      console.error(`Error loading ${url}:`, error)
      return null
    }
  }
  const createOfflineProject = async (project, bookCode) => {
    try {
      const bookLink = project.base_manifest.books.find(
        (book) => book.name === bookCode
      )?.link
      if (!bookLink) {
        throw new Error('Book link not found')
      }
      const chapters = await createChapters(bookLink, project.type)
      if (!chapters) {
        throw new Error('Chapters not created')
      }
      const zip = new JSZip()
      createProjectFiles(zip)

      const resourcesUrls = await getResourcesUrls(project.resources)
      if (!resourcesUrls) {
        throw new Error('Resource URLs not found')
      }
      await downloadResources(resourcesUrls, zip, project.type)
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
      const fileName = `${project.code}_${bookCode}.zip`
      saveAs(content, fileName)
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
                ? (book?.properties?.scripture?.toc1 ?? t('Book'))
                : (book?.properties?.obs?.title ?? t('OpenBibleStories'))
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
        <div className="flex items-end gap-7">
          <div
            className={`flex w-full flex-col space-y-4 ${
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
        <div className="flex w-auto gap-7 self-center sm:w-3/4">
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
            className="btn-secondary relative flex-1"
          >
            {t('Save')}
          </ButtonLoading>
        </div>
      </div>
    </div>
  )
}

export default Download
