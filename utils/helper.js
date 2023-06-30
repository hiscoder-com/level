import axios from 'axios'
import usfm from 'usfm-js'
import jsyaml from 'js-yaml'

import { JsonToPdf } from '@texttree/obs-format-convert-rcl'

import { supabase } from 'utils/supabaseClient'

import { obsStoryVerses } from './config'

export const checkLSVal = (el, val, type = 'string', ext = false) => {
  let value
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

// change the structure of the JSON object for the correct operation of the "obs-format-convert-rcl" library
export const createObjectToTransform = (ref) => {
  if (ref.json === null) {
    return
  }

  const objectToTransform = {
    verseObjects: [],
    title: `${ref.chapterNum}. ${ref.json[0] || ''}`,
    reference: ref.json[200] || '',
  }

  for (const [key, value] of Object.entries(ref.json)) {
    if (key !== '0' && key !== '200') {
      const verseObject = {
        path: `obs-en-${String(ref.chapterNum).padStart(2, '0')}-${String(key).padStart(
          2,
          '0'
        )}.jpg`,
        text: value,
      }
      objectToTransform.verseObjects.push(verseObject)
    }
  }

  return objectToTransform
}

export const compileChapter = (ref, downloadSettings, type = 'txt') => {
  if (!ref?.json) {
    return
  }

  let front = ''
  if (downloadSettings?.withFront) {
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

export const getBookJson = async (book_id) => {
  const { data } = await supabase
    .from('chapters')
    .select('num,text')
    .eq('book_id', book_id)
    .order('num')
  return data
}

export const downloadPdf = async ({
  json,
  book,
  title,
  fileName,
  chapterNum,
  htmlContent,
  projectTitle,
  projectLanguage,
  downloadSettings,
  createBookPdf = false,
  obs = false,
}) => {
  if (obs) {
    const styles = {
      projectTitle: {
        fontSize: 24,
        bold: true,
        alignment: 'center',
      },
      title: {
        fontSize: 24,
        bold: true,
        alignment: 'center',
        margin: [0, 250, 0, 0],
      },
      intro: { fontSize: 14 },
      image: {
        alignment: 'center',
        margin: [0, 10],
      },
      verseNumber: {
        sup: true,
        bold: true,
        opacity: 0.8,
      },
      text: {
        alignment: 'justify',
      },
      back: { fontSize: 14, alignment: 'center' },
      reference: {
        margin: [0, 10, 0, 0],
        italics: true,
      },
    }

    if (!fileName.endsWith('.pdf')) {
      fileName += '.pdf'
    }

    let pdfOptions = {
      data: [],
      styles,
      fileName,
    }

    if (downloadSettings?.withFront) {
      pdfOptions.bookPropertiesObs = {
        projectTitle,
        title,
      }
    }

    if (downloadSettings?.withImages === false) {
      pdfOptions.showImages = false
    }

    if (createBookPdf) {
      const chapters = await getBookJson(book?.id)

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
        }
      }

      if (downloadSettings?.withBack) {
        pdfOptions.bookPropertiesObs = {
          ...pdfOptions.bookPropertiesObs,
          back: book.properties.obs.back,
        }
      }
    } else {
      const objectToTransform = createObjectToTransform({ json, chapterNum })
      pdfOptions.data = [objectToTransform]
    }

    try {
      await JsonToPdf(pdfOptions)
      console.log('PDF creation completed')
    } catch (error) {
      console.error('PDF creation failed:', error)
    }
  } else {
    if (!htmlContent) {
      return
    }

    let new_window = window.open()
    new_window?.document.write(`<html lang="${projectLanguage?.code}">
    <head>
        <meta charset="UTF-8"/>
        <title>${fileName}</title>
        <style type="text/css">
          .break {
              page-break-after: always;
          }
      </style>
    </head>
    <body onLoad="window.print()">
        ${htmlContent}
        </body>
        </html>`)
    new_window?.document.close()
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
  const promises = Object.keys(resources).map(async (el) => {
    const url = resources[el].replace('/src/', '/raw/') + '/manifest.yaml'
    const { data } = await axios.get(url)

    const manifest = jsyaml.load(data, { json: true })

    if (current_method.resources[el]) {
      baseResource = { books: manifest.projects, name: el }
    }
    return {
      resource: el,
      url: resources[el],
      manifest,
    }
  })

  const manifests = await Promise.all(promises)

  let newResources = {}
  manifests.forEach((el) => {
    const url = el.url.split('://')[1].split('/')
    newResources[el.resource] = {
      owner: url[1],
      repo: url[2],
      commit: url[5],
      manifest: el.manifest,
    }
  })
  baseResource.books = baseResource.books.map((el) => ({
    name: el.identifier,
    link: resources[baseResource.name].replace('/src/', '/raw/') + el.path.substring(1),
  }))
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
      axios.defaults.headers.common['token'] = user?.access_token
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
