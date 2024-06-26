import axios from 'axios'
import usfm from 'usfm-js'

import { parseChapter } from 'utils/usfmHelper'
/**
 *  @swagger
 *  /api/git/whole-book:
 */

export default async function bibleHandler(req, res) {
  const { repo, owner, commit, bookPath } = req.query

  const url = `${
    process.env.NODE_HOST ?? 'https://git.door43.org'
  }/${owner}/${repo}/raw/commit/${commit}${bookPath.slice(1)}`
  try {
    const _data = await axios.get(url)
    const jsonData = await usfm.toJSON(_data.data)
    const chapters = {}
    for (const chapterNum in jsonData.chapters) {
      if (Object.hasOwnProperty.call(jsonData.chapters, chapterNum)) {
        const chapter = jsonData.chapters[chapterNum]
        const data = parseChapter(chapter, []).filter((el) => el.verse !== 'front')
        data.sort((a, b) => {
          const verseA = a.verse.match(/^\d+/)
          const verseB = b.verse.match(/^\d+/)
          return parseInt(verseA[0]) - parseInt(verseB[0])
        })
        chapters[chapterNum] = data
      }
    }

    return res.status(200).json(chapters)
  } catch (error) {
    return res.status(404).json({ error })
  }
}
