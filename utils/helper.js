import axios from 'axios'
import usfm from 'usfm-js'
import jsyaml from 'js-yaml'

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
  return new Date(date).toLocaleString(locale, {})
}

export const compileChapter = (ref, type = 'txt') => {
  if (!ref?.json) {
    return
  }
  if (Object.keys(ref.json).length > 0) {
    const text = Object.entries(ref?.json).reduce(
      (summary, verse) => {
        if (type === 'txt') {
          return summary + `${verse[0]}. ${verse[1] || ''}\n`
        } else {
          return summary + `<sup>${verse[0]}</sup> ${verse[1] || ''} `
        }
      },
      type === 'txt' ? ref?.title + '\n' : ''
    )
    return text
  }
}

const generateHTML = (main, title = '', subtitle = '', lang = 'en', dir = 'project') => {
  let new_window = window.open()
  new_window?.document.write(`<html lang="${lang}" dir="${dir}">
  <head>
      <meta charset="UTF-8"/>
      <title>${title}</title>      
  </head>
  <body onLoad="window.print()">
      <h1>${title}</h1>
      <h2>${subtitle}</h2>
      <div>${main}</div>
      </body>
      </html>`)
  new_window?.document.close()
}

export const downloadTxt = (text, title) => {
  if (!text || !title) {
    return
  }
  const element = document.createElement('a')
  const file = new Blob([text], { type: 'text/plain' })
  element.href = URL.createObjectURL(file)
  element.download = title
  element.click()
}

export const downloadPdf = (htmlContent, title, subTitle, projectLanguage) => {
  if (!htmlContent || !title) {
    return
  }
  generateHTML(htmlContent, title, subTitle, projectLanguage.code, projectLanguage.title)
}

export const convertToUsfm = ({ book, cl, toc1, project }) => {
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
      content: book.title,
    },
    {
      tag: 'toc1',
      content: toc1,
    },
    {
      tag: 'toc2',
      content: book.title,
    },
    {
      tag: 'toc3',
      content: book?.code ? capitalize(book?.code) : '',
    },
    {
      tag: 'mt',
      content: book.title,
    },
    {
      tag: 'cl',
      content: cl,
    },
  ]
  const chapters = {}
  if (book?.json.length > 0) {
    book.json.forEach((el) => {
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

export const countOfChaptersAndVerses = async ({ link }) => {
  const jsonChapterVerse = {}
  const errorParse = null
  try {
    const result = await axios.get(link)

    const jsonData = usfm.toJSON(result.data)
    if (Object.entries(jsonData?.chapters).length > 0) {
      Object.entries(jsonData?.chapters).forEach((el) => {
        jsonChapterVerse[el[0]] = Object.keys(el[1]).filter(
          (verse) => verse !== 'front'
        ).length
      })
    }
  } catch (error) {
    errorParse = error
  }

  return { data: jsonChapterVerse, error: errorParse }
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
        .catch((err) => console.log(err))
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
  delete cacheNotes[note_id]
  localStorage.setItem(key, JSON.stringify(cacheNotes))
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
      if (
        ['id', 'type', 'data'].find((el) => !Object?.keys(blockElement)?.includes(el))
      ) {
        return false
      }
    }
  }
  return true
}
