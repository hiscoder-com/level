import usfm from 'usfm-js'

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

export const compileChapter = (chapter, type = 'txt') => {
  if (Object.keys(chapter).length > 0) {
    const text = Object.entries(chapter).reduce((txt, verse) => {
      if (type === 'txt') {
        return txt + `${verse[0]}. ${verse[1] || ''}\n`
      } else {
        return txt + `<sup>${verse[0]}</sup> ${verse[1] || ''} `
      }
    }, '')
    return text
  }
}

const generateHTML = (main, title = 'pdf', lang = 'en', dir = 'project') => {
  let new_window = window.open()
  new_window?.document.write(`<html lang="${lang}" dir="${dir}">
  <head>
      <meta charset="UTF-8"/>
      <title>${title}</title>
      <style type="text/css">
          body > div {
              page-break-after: always;
          }
      </style>
  </head>
  <body onLoad="window.print()">
      <h1>${title}</h1>
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

export const downloadPdf = (htmlContent, title, projectLanguage) => {
  if (!htmlContent || !title) {
    return
  }
  generateHTML(htmlContent, title, projectLanguage.code, projectLanguage.title)
}

export const convertUsfm = ({ book, cl, project }) => {
  const headers = [
    {
      tag: 'id',
      content: `${book.code.toUpperCase()} ${project.code.toUpperCase()} ${
        project.language.code
      }_${project.language.orig_name}_${project.title}  ${Date()} v-cana`,
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
      // content: 'Послание Иуды',
    },
    {
      tag: 'toc2',
      content: book.title,
    },
    {
      tag: 'toc3',
      content: book?.code
        ? book?.code[0].toUpperCase() + book?.code.slice(1)
        : book?.code,
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
  for (const [num, chapter] of Object.entries(book?.json)) {
    const oneChapter = {}
    if (chapter) {
      for (const [key, verse] of Object.entries(chapter)) {
        oneChapter[key] = { verseObjects: [{ type: 'text', text: verse + '\n' }] }
      }
    }
    chapters[num] = oneChapter
  }
  const contentUsfm = usfm.toUSFM({ chapters, headers }, { forcedNewLines: true })
  return contentUsfm
}
