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

export const countOfChaptersAndVerses = async ({ link, book_code }) => {
  const jsonChapterVerse = {}
  const errorParse = null
  if (book_code === 'obs') {
    try {
      for (let index = 1; index <= 50; index++) {
        const chapterNum = String(index).padStart(2, '0')
        const res = await axios.get(link + '/' + chapterNum + '.md')

        jsonChapterVerse[chapterNum] = mdToJson(res.data).verseObjects.length
      }
    } catch (error) {
      errorParse = error
    }
  } else {
    try {
      const result = await axios.get(link)
      const jsonData = usfm.toJSON(result.data)
      if (Object.entries(jsonData?.chapters).length > 0) {
        Object.entries(jsonDataclg?.chapters).forEach((el) => {
          jsonChapterVerse[el[0]] = Object.keys(el[1]).filter(
            (verse) => verse !== 'front'
          ).length
        })
      }
    } catch (error) {
      errorParse = error
    }
  }

  return { data: jsonChapterVerse, error: errorParse }
}
export const mdToJson = (md) => {
  let _markdown = md.replaceAll('\u200B', '').split(/\n\s*\n\s*/)
  const title = _markdown.shift().trim().slice(1)
  let reference = _markdown.pop().trim().slice(1, -1)
  if (reference === '') {
    reference = _markdown.pop().trim().slice(1, -1)
  }
  const verseObjects = []
  let verseObjectsExtended = []
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

  verseObjectsExtended = [
    ...verseObjects,
    { text: title, verse: '0' },
    { text: reference, verse: '200' },
  ].sort((a, b) => a.verse - b.verse)

  return { verseObjects, title, reference, verseObjectsExtended }
}

export const uniqueFilter = (uniqueObject, key, value) => {
  if (!uniqueObject?.[key]) {
    uniqueObject[key] = [value]
    return false
  } else {
    return true
  }
}

export const getListWordsReference = (data) => {
  if (!data) {
    return
  }
  const list = {}

  data.forEach((verse) => {
    if (!list?.[verse.TWLink]) {
      list[verse.TWLink] = [verse.Reference]
      return
    }
    list[verse.TWLink].push(verse.Reference)
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
