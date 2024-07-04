const getText = (verseObject) => {
  return verseObject.text || verseObject.nextChar || ''
}

const getFootnote = (verseObject) => {
  const content = verseObject.content
    .replace(/\\fqa\s(.*?)\\/g, '*$1*')
    .replace(/\\fq(.*?)\\/g, '*$1*')
    .replace(/\\fr(.*?)\\/g, '')
    .replace(
      /\\ft\*|\\f\*|f\*|fq\*|fqa\*|\\ft|\\f|fq|fqa|ft|ft|\\fr|\\fr\*|fr\*|fr|\+|\*|\\xt|\\xt*/g,
      ''
    )
    .trim()
  return '<span style="color:#332f2c"> [' + content + '] </span>'
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

const getSection = (verseObject) => {
  if (!verseObject.tag) {
    return verseObject.content
  }
  switch (verseObject.tag) {
    case 's':
    case 's1':
      return (
        '<span style="display:block;margin-top:8px;text-align:center">' +
        verseObject.content +
        '</span>'
      )
    default:
      return verseObject.content
  }
}

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
      return text ? '***' + text + '***' : ''
  }
}

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
    resultChapter = resultChapter.filter(([verse]) => {
      const range = verse.split('-')
      if (range.length > 1) {
        for (let i = parseInt(range[0]); i <= parseInt(range[1]); i++) {
          if (verses.includes(String(i))) {
            return true
          }
        }
      } else {
        return verses.includes(String(verse))
      }
    })
  }
  return resultChapter.map((el) => {
    return { verse: el[0], text: getVerseText(el[1].verseObjects, true) }
  })
}
