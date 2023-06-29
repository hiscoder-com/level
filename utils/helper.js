import axios from 'axios'
import usfm from 'usfm-js'
import jsyaml from 'js-yaml'
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

const compileMarkdown = async (ref) => {
  const title = ref.json[0] ? `# ${ref.json[0]}\n\n` : ''
  const reference = ref.json[200] ? `_${ref.json[200]}_` : ''
  let markdown = ''
  for (const key in ref.json) {
    if (Object.hasOwnProperty.call(ref.json, key)) {
      if (ref.json[key] && !['0', '200'].includes(key)) {
        const image = `![OBS Image](https://cdn.door43.org/obs/jpg/360px/obs-en-${String(
          ref.chapterNum
        ).padStart(2, '0')}-${String(key).padStart(2, '0')}.jpg)\n\n`

        const verse = ref.json[key]
        markdown += image + verse + '\n\n'
      }
    }
  }
  return title + markdown + reference
}

export const compilePdfObs = async (ref, downloadSettings) => {
  const title = ref.json[0] ? `<h1>${ref.json[0]}</h1>` : ''
  const reference = ref.json[200]
    ? `<p class="break"><em> ${ref.json[200]} </em></p>`
    : ''
  let frames = ''
  for (const key in ref.json) {
    if (Object.hasOwnProperty.call(ref.json, key)) {
      if (ref.json[key] && !['0', '200'].includes(key)) {
        const image = downloadSettings.withImages
          ? `<p><img alt="OBS Image"src="https://cdn.door43.org/obs/jpg/360px/obs-en-${String(
              ref.chapterNum
            ).padStart(2, '0')}-${String(key).padStart(2, '0')}.jpg"/></p>`
          : ''
        const verse = `<p>${ref.json[key]}</p>`
        frames += `<div>${image}${verse}</div>`
      }
    }
  }

  return title + frames + reference
}

export const compileChapter = async (ref, type = 'txt', downloadSettings) => {
  if (!ref?.json) {
    return
  }
  if (['markdown', 'pdf-obs'].includes(type)) {
    switch (type) {
      case 'markdown':
        return await compileMarkdown(ref)
      case 'pdf-obs':
        if (downloadSettings?.withFront) {
          const title = ref?.book?.properties?.obs?.title
            ? `<h1>${ref?.book?.properties?.obs?.title}</h1>`
            : ''
          const front = `<div class="break" style="text-align: center"><h1>${ref?.project?.title}</h1>${title}</div>`
          return front + (await compilePdfObs(ref, downloadSettings))
        } else {
          return await compilePdfObs(ref, downloadSettings)
        }
      default:
        break
    }
  }
  let front = ''
  if (downloadSettings?.withFront) {
    front = `<div class="break" style="text-align: center"><h1>${ref?.project?.title}</h1><h1>${ref?.book?.properties?.scripture?.toc1}</h1></div>`
  }
  if (Object.keys(ref.json).length > 0) {
    const text = Object.entries(ref.json).reduce(
      (summary, verse) => {
        if (type === 'txt') {
          return summary + `${verse[0]}. ${verse[1] || ''}\n`
        } else {
          return summary + `<sup>${verse[0]}</sup> ${verse[1] || ''} `
        }
      },
      type === 'txt'
        ? ref?.title + '\n'
        : front +
            `<h1>${ref?.book?.properties?.scripture?.chapter_label} ${ref.chapterNum}</h1>`
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

export const downloadPdf = ({ htmlContent, projectLanguage, fileName }) => {
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
