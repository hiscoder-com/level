export const mdToJson = (md) => {
  let _markdown = md.replaceAll('\u200B', '').split(/\n\s*\n\s*/)
  const header = _markdown.shift().trim().slice(1)
  let link = _markdown.pop().trim().slice(1, -1)
  if (link === '') {
    link = _markdown.pop().trim().slice(1, -1)
  }
  const versesObjects = []

  for (let n = 0; n < _markdown.length / 2; n++) {
    let urlImage
    let text
    if (/\(([^)]*)\)/g.test(_markdown[n * 2])) {
      urlImage = /\(([^)]*)\)/g.exec(_markdown[n * 2])[1]
      text = _markdown[n * 2 + 1]
    } else {
      text = _markdown[n * 2] + '\n' + _markdown[n * 2 + 1]
    }
    versesObjects.push({ urlImage, text, key: (n + 1).toString() })
  }
  return { versesObjects, header, link }
}
