import axios from 'axios'
import usfm from 'usfm-js'
import jsyaml from 'js-yaml'

import { JsonToPdf } from '@texttree/obs-format-convert-rcl'

import { obsStoryVerses } from './config'
const isServer = typeof window === 'undefined'

export const checkLSVal = (el, val, type = 'string', ext = false) => {
  let value
  if (isServer) {
    return val
  }
  switch (type) {
    case 'object':
      try {
        value = JSON.parse(localStorage.getItem(el))
      } catch (error) {
        localStorage.setItem(el, JSON.stringify(val))
        return val
      }
      break
    case 'boolean':
      if (localStorage.getItem(el) === null) {
        value = null
      } else {
        value = localStorage.getItem(el) === 'true'
      }
      break

    case 'string':
    default:
      value = localStorage.getItem(el)
      break
  }

  if (value === null || (ext && !value[ext])) {
    localStorage.setItem(el, type === 'string' ? val : JSON.stringify(val))
    return val
  } else {
    return value
  }
}

export const readableDate = (date, locale = 'ru') => {
  return new Intl.DateTimeFormat(locale, {
    year: '2-digit',
    month: 'numeric',
    day: 'numeric',
  }).format(new Date(date))
}

export const createObjectToTransform = (ref, partOfChapterTitle) => {
  if (ref.json === null) {
    return
  }

  const { chapterNum, json } = ref
  const objectToTransform = {
    verseObjects: [],
    title: `${chapterNum}.`,
    reference: ' ', // PDF Bible does not work without reference
  }

  if (json[0] && json[200]) {
    objectToTransform.title = `${chapterNum}. ${json[0]}`
    objectToTransform.reference = json[200]

    for (const [key, value] of Object.entries(json)) {
      if (key !== '0' && key !== '200') {
        const verseObject = {
          path: `obs-en-${String(chapterNum).padStart(2, '0')}-${String(key).padStart(
            2,
            '0'
          )}.jpg`,
          text: value,
        }
        objectToTransform.verseObjects.push(verseObject)
      }
    }
  } else {
    objectToTransform.title = `${partOfChapterTitle} ${chapterNum}`

    for (const [key, value] of Object.entries(json)) {
      const verseObject = {
        text: value,
        verse: key,
      }
      objectToTransform.verseObjects.push(verseObject)
    }
  }
  return objectToTransform
}

export const compileChapter = (ref, withFront, type = 'txt') => {
  if (!ref?.json) {
    return
  }
  let front = ''
  if (withFront) {
    front = `<div class="break" style="text-align: center"><h1>${ref?.project?.title}</h1><h1>${ref?.book?.properties?.scripture?.toc1}</h1></div>`
  }

  if (Object.keys(ref.json).length > 0) {
    const text = Object.entries(ref.json).reduce(
      (summary, [key, value]) => {
        const verseText =
          type === 'txt'
            ? `${key}. ${value || ''}\n`
            : `<sup>${key}</sup> ${value || ''} `
        return summary + verseText
      },
      type === 'txt'
        ? `${ref.title}\n`
        : `${front}<h1>${ref.book.properties.scripture.chapter_label} ${ref.chapterNum}</h1>`
    )

    return text
  }
}

export const downloadFile = ({ text, title, type = 'text/plain' }) => {
  if (!text || !title) {
    return
  }
  const element = document.createElement('a')
  const file = new Blob([text], { type })
  element.href = URL.createObjectURL(file)
  element.download = title
  element.click()
}

export const downloadPdf = async ({
  t,
  book,
  title,
  chapter,
  chapters,
  fileName,
  projectTitle,
  projectLanguage,
  downloadSettings,
  obs = false,
}) => {
  const commonStyles = {
    titlePageTitle: { alignment: 'center', fontSize: 32, bold: true, margin: [73, 20] },
    SubtitlePageTitle: {
      alignment: 'center',
      fontSize: 20,
      bold: true,
      margin: [73, 0, 73, 20],
    },
    chapterTitle: { fontSize: 20, bold: true, margin: [0, 26, 0, 15] },
    currentPage: { alignment: 'center', fontSize: 16, bold: true, margin: [0, 10, 0, 0] },
    projectLanguage: { alignment: 'center', bold: true, margin: [73, 15, 73, 0] },
    copyright: { alignment: 'center', margin: [0, 10, 0, 0] },
    defaultPageHeader: { bold: true, width: '50%' },
    text: {
      alignment: 'justify',
    },
  }

  const obsStyles = {
    image: {
      alignment: 'center',
      margin: [0, 15],
    },
    reference: {
      margin: [0, 10, 0, 0],
      italics: true,
    },
    tableOfContentsTitle: { alignment: 'center', margin: [0, 0, 0, 20] },
    back: { alignment: 'center' },
  }

  const bibleStyles = {
    chapterTitle: { fontSize: 32, bold: true },
    verseNumber: {
      sup: true,
      bold: true,
      opacity: 0.8,
    },
  }
  const styles = obs
    ? { ...commonStyles, ...obsStyles }
    : { ...commonStyles, ...bibleStyles }

  let pdfOptions

  const createPdfOptionsObs = (chapters, downloadSettings, book) => {
    if (!fileName.endsWith('.pdf')) {
      fileName += '.pdf'
    }
    pdfOptions = {
      styles,
      fileName,
      data: [],
      showChapterTitlePage: false,
      bookPropertiesObs: {
        SubtitlePageTitle: title,
        back: ' ', // to display the page headers
      },
      imageUrl: `${
        process.env.NEXT_PUBLIC_INTRANET
          ? process.env.NEXT_PUBLIC_NODE_HOST
          : 'https://cdn.door43.org'
      }/obs/jpg/360px/`,
    }

    if (downloadSettings?.withFront) {
      pdfOptions.bookPropertiesObs = {
        ...pdfOptions.bookPropertiesObs,
        titlePageTitle: projectTitle,
        copyright: 'TextTree Movement®',
        projectLanguage,
      }
    }

    if (downloadSettings?.withImages === false) {
      pdfOptions.showImages = false
    }

    if (book) {
      pdfOptions.data = chapters
        .filter((chapter) => chapter.text !== null)
        .map((chapter) =>
          createObjectToTransform({
            json: chapter.text,
            chapterNum: chapter.num,
          })
        )

      if (downloadSettings?.withIntro) {
        pdfOptions.bookPropertiesObs = {
          ...pdfOptions.bookPropertiesObs,
          intro: book.properties.obs.intro,
          tableOfContentsTitle: t('TableOfContents'),
        }
      }

      if (downloadSettings?.withBack) {
        pdfOptions.bookPropertiesObs = {
          ...pdfOptions.bookPropertiesObs,
          back: book.properties.obs.back,
        }
      }
    } else {
      pdfOptions.data = [createObjectToTransform(chapter)]
    }

    return pdfOptions
  }

  const createPdfOptionsBible = (chapters, downloadSettings, book) => {
    const partOfChapterTitle = t('Chapter')
    pdfOptions = {
      styles,
      fileName,
      data: [],
      showVerseNumber: true,
      combineVerses: true,
      showTitlePage: false,
      showChapterTitlePage: false,
      bookPropertiesObs: {
        SubtitlePageTitle: title,
        back: ' ', // to display the page headers
      },
    }

    if (downloadSettings?.withFront) {
      pdfOptions.bookPropertiesObs = {
        ...pdfOptions.bookPropertiesObs,
        titlePageTitle: projectTitle,
        projectLanguage,
        copyright: 'TextTree Movement®',
      }
    }

    if (book) {
      pdfOptions.data = chapters
        .filter((chapter) => chapter.text !== null)
        .map((chapter) =>
          createObjectToTransform(
            {
              json: chapter.text,
              chapterNum: chapter.num,
            },
            partOfChapterTitle
          )
        )
    } else {
      if (!chapter) {
        return
      }
      pdfOptions.data = [createObjectToTransform(chapter, partOfChapterTitle)]
    }

    return pdfOptions
  }

  pdfOptions = obs
    ? createPdfOptionsObs(chapters, downloadSettings, book)
    : createPdfOptionsBible(chapters, downloadSettings, book)
  try {
    await JsonToPdf(pdfOptions)
  } catch (error) {
    console.error('Error generating PDF:', error)
  }
}

export const convertToUsfm = ({ jsonChapters, book, project }) => {
  if (!jsonChapters || !book || !project) {
    return
  }

  const capitalize = (text) => {
    if (!text) {
      return ''
    }
    if (text.search(/\d/) === 0) {
      text = text.split('')
      text[1] = text[1].toUpperCase()
      text = text.join('')
      return text
    } else {
      return text[0].toUpperCase() + text.slice(1)
    }
  }
  const { h, toc1, toc2, toc3, mt } = book?.properties?.scripture

  const headers = [
    {
      tag: 'id',
      content: `${book?.code.toUpperCase()} ${project?.code.toUpperCase()} ${
        project?.language.code
      }_${capitalize(project?.language?.orig_name)}_${project?.title} ${Date()} v-cana`,
    },
    {
      tag: 'usfm',
      content: '3.0',
    },
    {
      tag: 'ide',
      content: 'UTF-8',
    },
    {
      tag: 'h',
      content: h,
    },
    {
      tag: 'toc1',
      content: toc1,
    },
    {
      tag: 'toc2',
      content: toc2,
    },
    {
      tag: 'toc3',
      content: toc3,
    },
    {
      tag: 'mt',
      content: mt,
    },
    {
      tag: 'cl',
      content: book?.properties?.scripture?.chapter_label,
    },
  ]
  const chapters = {}
  if (jsonChapters.length > 0) {
    jsonChapters.forEach((el) => {
      const oneChapter = {}
      if (el.text) {
        for (const [num, verse] of Object.entries(el.text)) {
          oneChapter[num] = {
            verseObjects: [{ type: 'text', text: verse ? verse + '\n' : '' }],
          }
        }
        oneChapter['front'] = {
          verseObjects: [{ type: 'paragraph', tag: 'p', nextChar: '\n' }],
        }
      }
      chapters[el.num] = oneChapter
    })
  }
  const contentUsfm = usfm.toUSFM({ chapters, headers }, { forcedNewLines: true })
  return contentUsfm
}

export const parseManifests = async ({ resources, current_method }) => {
  let baseResource = {}

  const getBaseResourceUrl = (urlArray) =>
    `${process.env.NODE_HOST ?? 'https://git.door43.org'}/${urlArray[1]}/${
      urlArray[2]
    }/raw/commit/${urlArray[4]}`

  const promises = Object.keys(resources).map(async (el) => {
    const { pathname } = new URL(resources[el])
    const urlArray = pathname.split('/')
    const url = getBaseResourceUrl(urlArray)
    const manifestUrl = getBaseResourceUrl(urlArray) + '/manifest.yaml'
    const { data } = await axios.get(manifestUrl)
    const manifest = jsyaml.load(data, { json: true })

    if (current_method.resources[el]) {
      baseResource = { books: manifest.projects, name: el }
    }
    return {
      resource: el,
      url,
      manifest,
    }
  })

  const manifests = await Promise.all(promises)

  let newResources = {}
  manifests.forEach((el) => {
    const { pathname } = new URL(el.url)
    const url = pathname.split('/')
    newResources[el.resource] = {
      owner: url[1],
      repo: url[2],
      commit: url[5],
      manifest: el.manifest,
    }
  })
  baseResource.books = baseResource.books.map((el) => {
    const { pathname } = new URL(resources[baseResource.name])
    const urlArray = pathname.split('/')
    const url = getBaseResourceUrl(urlArray)

    return {
      name: el.identifier,
      link: url + el.path.substring(1),
    }
  })
  return { baseResource, newResources }
}

export const countOfChaptersAndVerses = async ({ link, book_code }) => {
  let jsonChapterVerse = {}
  let usfmData = ''

  if (book_code === 'obs') {
    return { data: obsStoryVerses, error: null }
  }

  try {
    usfmData = await axios.get(link)
  } catch (error) {
    return { data: null, error }
  }
  try {
    const jsonData = usfm.toJSON(usfmData.data)
    if (Object.entries(jsonData?.chapters).length > 0) {
      Object.keys(jsonData?.chapters).forEach((chapterNum) => {
        jsonChapterVerse[chapterNum] = Object.keys(jsonData?.chapters[chapterNum]).filter(
          (verse) => verse !== 'front'
        ).length
      })
    }
  } catch (error) {
    return { data: null, error }
  }

  return { data: jsonChapterVerse, error: null }
}

export const mdToJson = (md) => {
  let _markdown = md.replaceAll('\u200B', '').split(/\n\s*\n\s*/)
  const title = _markdown.shift().trim().slice(1)
  let reference = _markdown.pop().trim().slice(1, -1)
  if (reference === '') {
    reference = _markdown.pop().trim().slice(1, -1)
  }
  const verseObjects = []

  for (let n = 0; n < _markdown.length / 2; n++) {
    let urlImage
    let text
    if (/\(([^)]*)\)/g.test(_markdown[n * 2])) {
      urlImage = /\(([^)]*)\)/g.exec(_markdown[n * 2])[1]
      text = _markdown[n * 2 + 1]
    } else {
      text = _markdown[n * 2] + '\n' + _markdown[n * 2 + 1]
    }
    verseObjects.push({ urlImage, text, verse: (n + 1).toString() })
  }

  const additionalVerses = [
    { text: title, verse: '0' },
    { text: reference, verse: '200' },
  ]

  return { verseObjects, title, reference, additionalVerses }
}

export const getListWordsReference = (data) => {
  if (!data) {
    return
  }
  const list = {}

  data.forEach((verse) => {
    if (!list?.[verse.TWLink]) {
      list[verse.TWLink] = [verse.Reference]
    } else {
      list[verse.TWLink].push(verse.Reference)
    }
  })

  return { ...list }
}
export const uniqueFilterInBook = (wordsBook, item, wordObject) => {
  if (wordsBook?.[item.url]) {
    const [chapterCurrentWord, verseCurrentWord] = item.reference
      .split(':')
      .map((el) => parseInt(el))
    const [chapterFirstLink, verseFirstLink] = wordsBook[item.url][0]
      .split(':')
      .map((el) => parseInt(el))

    if (chapterFirstLink !== chapterCurrentWord) {
      return chapterFirstLink < chapterCurrentWord
    } else {
      if (verseFirstLink !== verseCurrentWord) {
        return verseFirstLink < verseCurrentWord
      } else {
        return wordObject.repeatedInChunk || wordObject.repeatedInVerse
      }
    }
  }
}

export const saveCacheNote = (key, note, user) => {
  if (!note) {
    return
  }
  const cache = JSON.parse(localStorage.getItem(key))
  if (!note?.data?.blocks?.length) {
    if (cache?.[note.id]?.length) {
      axios
        .post(`/api/logs`, {
          message: `${key} saved empty`,
          note,
          cache: cache?.[note.id],
          user_id: user?.id,
        })
        .then()
        .catch(console.log)
    }
    return
  }
  if (!cache) {
    localStorage.setItem(key, JSON.stringify({ [note.id]: [note] }))
    return
  }

  if (cache[note.id]?.length) {
    const cacheNotes = cache[note.id]
    cacheNotes.sort((a, b) => a.changed_at - b.changed_at)
    if (cacheNotes.length >= 5) {
      cacheNotes.shift()
    }
    cacheNotes.push(note)
    cache[note.id] = cacheNotes
    localStorage.setItem(key, JSON.stringify(cache))
  } else {
    cache[note.id] = [note]
    localStorage.setItem(key, JSON.stringify(cache))
  }
}

export const removeCacheNote = (key, note_id) => {
  if (!note_id) {
    return
  }
  const cacheNotes = JSON.parse(localStorage.getItem(key))

  if (cacheNotes) {
    delete cacheNotes[note_id]
    localStorage.setItem(key, JSON.stringify(cacheNotes))
  }
}

export const validateNote = (note) => {
  if (!note) {
    return false
  }

  if (['blocks', 'version'].find((el) => !Object?.keys(note)?.includes(el))) {
    return false
  }

  if (note.blocks?.length) {
    for (const blockElement of note.blocks) {
      if (['type', 'data'].find((el) => !Object?.keys(blockElement)?.includes(el))) {
        return false
      }
    }
  }
  return true
}

export const validateTitle = (title) => {
  return title && title.trim().length > 0
}

export const obsCheckAdditionalVerses = (numVerse) => {
  if (['0', '200'].includes(String(numVerse))) {
    return ''
  }

  return String(numVerse)
}

export function filterNotes(newNote, verse, notes) {
  if (Array.isArray(verse)) {
    verse.forEach((el) => {
      if (!notes[el]) {
        notes[el] = [newNote]
      } else {
        notes[el].push(newNote)
      }
    })
  } else {
    if (!notes[verse]) {
      notes[verse] = [newNote]
    } else {
      notes[verse].push(newNote)
    }
  }
}
export const validationBrief = (brief_data) => {
  if (!brief_data) {
    return { error: 'Properties is null or undefined' }
  }
  if (Array.isArray(brief_data)) {
    const isValidKeys = brief_data.find((briefObj) => {
      const isNotValid =
        JSON.stringify(Object.keys(briefObj).sort()) !==
        JSON.stringify(['block', 'id', 'resume', 'title'].sort())
      if (isNotValid) {
        return { error: 'brief_data is not valid', briefObj }
      } else {
        briefObj.block?.forEach((blockObj) => {
          if (
            JSON.stringify(Object.keys(blockObj).sort()) !==
            JSON.stringify(['question', 'answer'].sort())
          ) {
            return { error: 'brief_data.block has different keys', blockObj }
          }
        })
      }
    })
    if (isValidKeys) {
      return { error: 'brief_data has different keys', isValidKeys }
    }
  }

  return { error: null }
}

export const getWords = async ({ zip, repo, wordObjects }) => {
  if (!zip || !repo || !wordObjects) {
    return []
  }

  const promises = wordObjects.map(async (wordObject) => {
    const uriMd = repo + '/' + wordObject.TWLink.split('/').slice(-3).join('/') + '.md'

    try {
      const markdown = await zip.files[uriMd].async('string')
      const splitter = markdown?.search('\n')
      return {
        ...wordObject,
        title: markdown?.slice(0, splitter),
        text: markdown?.slice(splitter),
      }
    } catch (error) {
      return null
    }
  })
  return await Promise.all(promises)
}

export const stepValidation = (step) => {
  try {
    const obj = JSON.parse(JSON.stringify(step))
    if (!obj || typeof obj !== 'object') {
      throw new Error('This is incorrect json')
    }
    const base = ['intro', 'description', 'title', 'id', 'is_awaiting_team']
    if (!JSON.stringify(Object.keys(step).every((element) => base.includes(element)))) {
      throw new Error('Step has different keys')
    }
  } catch (error) {
    return { error }
  }
  return { error: null }
}

export const stepsValidation = (steps) => {
  if (!steps?.length) {
    return { error: 'This is incorrect json', steps }
  }
  for (const step of steps) {
    try {
      const { error } = stepValidation(step)
      if (error) throw error
    } catch (error) {
      return { error }
    }
  }
  return { error: null }
}

export const convertNotesToTree = (notes, parentId = null) => {
  const filteredNotes = notes?.filter((note) => note.parent_id === parentId)

  filteredNotes?.sort((a, b) => a.sorting - b.sorting)
  return filteredNotes?.map((note) => ({
    id: note.id,
    name: note.title,
    ...(note.is_folder && {
      children: convertNotesToTree(notes, note.id),
    }),
  }))
}

export function checkBookCodeExists(bookCode, data) {
  return Array.isArray(data) && data.some((book) => book.book_code === bookCode)
}

export function checkChapterVersesExist(bookCode, chapterNumber, data) {
  if (!data) {
    return false
  }

  return data.some(
    (book) =>
      book.book_code === bookCode &&
      book.chapters &&
      book.chapters[chapterNumber] &&
      book.chapters[chapterNumber].verseObjects.length > 0
  )
}

export function getVerseObjectsForBookAndChapter(chapters, bookCode, chapterNumber) {
  if (chapters && Array.isArray(chapters)) {
    const chapterData = chapters.find(
      (chapter) => chapter.book_code === bookCode && chapter.level_check === null
    )

    if (chapterData) {
      return chapterData.chapters[chapterNumber]
    }
  }

  return []
}

export function getVerseCount(books, bookCode, chapterNumber) {
  for (let i = 0; i < books?.length; i++) {
    if (books[i].code === bookCode) {
      const chapters = books[i].chapters
      if (chapters.hasOwnProperty(chapterNumber)) {
        return chapters[chapterNumber]
      }
    }
  }
  return null
}

export function getVerseCountOBS(chaptersData, chapterNumber) {
  const chapterData = chaptersData?.[0].chapters
  if (!chapterData) {
    return
  }

  chapterNumber = chapterNumber < 10 ? `0${chapterNumber}` : `${chapterNumber}`
  return chapterNumber in chapterData ? chapterData[chapterNumber] : 0
}

function buildTree(items) {
  if (!items) {
    return
  }

  const tree = []
  const itemMap = {}

  items.forEach((item) => {
    item.children = []
    itemMap[item.id] = item
  })

  items.forEach((item) => {
    if (item?.parent_id) {
      const parentItem = itemMap[item.parent_id]
      if (parentItem) {
        parentItem.children.push(item)
      } else {
        console.error(
          `Parent item with id ${item.parent_id} not found for item with id ${item.id}`
        )
      }
    } else {
      tree.push(item)
    }
  })

  return tree
}

function removeIdsFromTree(tree) {
  function removeIdsFromItem(item) {
    delete item.id
    delete item.parent_id
    delete item?.user_id
    delete item?.project_id

    item?.data?.blocks?.forEach((block) => delete block.id)
    item.children.forEach((child) => removeIdsFromItem(child))
  }

  if (!tree) {
    return
  }

  tree.forEach((item) => removeIdsFromItem(item))

  return tree
}

export function formationJSONToTree(data) {
  const treeData = buildTree(data)
  const transformedData = removeIdsFromTree(treeData)

  return transformedData
}

export const getBriefName = (briefName, defautlName) => {
  if (!defautlName) {
    return 'Brief'
  }
  if (!briefName || briefName === 'Brief') {
    return defautlName
  } else {
    return briefName
  }
}

export const getImageUrl = (imageUrl) => {
  if (typeof imageUrl === 'string') {
    return imageUrl
  }
  return ''
}
