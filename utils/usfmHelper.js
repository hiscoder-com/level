const getText = (verseObject) => {
  return verseObject.text || verseObject.nextChar || ''
}

/**
 * Function for extracting content from text using regular expressions
 * @param {string} text
 * @param {string} regular_expression
 *
 * @returns {null or string}
 */
const getContentFromString = (text, pattern) => {
  const match = text.match(pattern)
  return match ? match[1] : null
}

/**
 * Function for getting the text of the footnote
 * @param {object} verseObject
 *
 * @returns {string}
 */
const getFootnote = (verseObject) => {
  const link = getContentFromString(verseObject.content, /\\fr (.*?) \\ft/)
  const content = getContentFromString(verseObject.content, /\\ft (.*)/)
  if (!link || !content) {
    return '<sub>' + verseObject.content + '</sub>'
  } else {
    return `[^${link}]
  [^${link}]: <sub>${content.replaceAll('\\xt', '')}</sub>
    \\n`
  }
}

const getMilestone = (verseObject, showUnsupported) => {
  const { tag, children } = verseObject
  switch (tag) {
    case 'k':
      return children.map((child) => getObject(child, showUnsupported)).join(' ')
    case 'zaln':
      if (children.length === 1 && children[0].type === 'milestone') {
        return getObject(children[0], showUnsupported)
      } else {
        return getAlignedWords(children)
      }
    default:
      return ''
  }
}
const getAlignedWords = (verseObjects) => {
  return verseObjects
    .map((verseObject) => {
      return getWord(verseObject)
    })
    .join('')
}

/**
 * Function for processing the section
 * @param {object} verseObject
 *
 * @returns {string}
 */
const getSection = (verseObject) => {
  if (!verseObject.tag) {
    return verseObject.content
  }
  switch (verseObject.tag) {
    case 's1':
      return '<div align="center">' + verseObject.content + '</div>'

    default:
      return verseObject.content
  }
}

/**
 * Function for processing tags
 * @param {object} verseObject
 *
 * @returns {string}
 */
const getTag = (verseObject) => {
  const { tag } = verseObject
  const text = verseObject.content || verseObject.text
  switch (tag) {
    case 'it':
      return '*' + text + '*'
    case 'bd':
      return '**' + text + '**'
    case 'no':
      return text
    case 'sc':
      return '<sub>' + text + '</sub>'
    case 'sup':
      return '<sup>' + text + '</sup>'
    default:
      return '***' + text + '***'
  }
}

/**
 * Function for processing unsupported elements
 * @param {object} verseObject
 *
 * @returns {string}
 */
const getUnsupported = (verseObject) => {
  if (verseObject.tag) {
    return getTag(verseObject)
  }
  return '***' + (verseObject.content || verseObject.text) + '***'
}

const getWord = (verseObject) => {
  return verseObject.text || verseObject.content
}

const getVerseText = (verseObjects, showUnsupported = false) => {
  return verseObjects
    .map((verseObject) => getObject(verseObject, showUnsupported))
    .join('')
}

const getObject = (verseObject, showUnsupported) => {
  const { type } = verseObject
  switch (type) {
    case 'quote':
    case 'text':
      return getText(verseObject)
    case 'milestone':
      return getMilestone(verseObject, showUnsupported)
    case 'word':
      if (verseObject.strong) {
        return getAlignedWords([verseObject])
      } else {
        return getWord(verseObject)
      }
    case 'section':
      return getSection(verseObject)
    case 'paragraph':
      return '\n'
    case 'footnote':
      return getFootnote(verseObject)
    default:
      if (showUnsupported) {
        return getUnsupported(verseObject)
      } else {
        return ''
      }
  }
}

export const parseChapter = (chapter, verses) => {
  let resultChapter = Object.entries(chapter)
  if (verses && verses.length > 0) {
    resultChapter = resultChapter.filter((el) => verses.includes(el[0]))
  }
  return resultChapter.map((el) => {
    return { verse: el[0], text: getVerseText(el[1].verseObjects, true) }
  })
}
