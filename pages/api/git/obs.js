import axios from 'axios'

import { mdToJson } from 'utils/helper'

/**
 *  @swagger
 *  /api/git/obs:
 *    get:
 *      summary: Returns obs verses
 *      description: Returns verses
 *      parameters:
 *       - name: repo
 *         in: query
 *         description: code of repo
 *         required: true
 *         schema:
 *           type: string
 *           example: obs
 *       - name: commit
 *         in: query
 *         description: sha of commit
 *         required: true
 *         schema:
 *           type: string
 *           example: 921aaa41e3fe2a24f1a66c789d1840abab019131
 *       - name: owner
 *         in: query
 *         description: owner
 *         required: true
 *         schema:
 *           type: string
 *           example: ru_gl
 *       - name: bookPath
 *         in: query
 *         description: path of the book
 *         required: true
 *         schema:
 *           type: string
 *           example: ./content
 *       - name: language
 *         in: query
 *         description: code of the language
 *         required: true
 *         schema:
 *           type: string
 *           example: ru
 *       - name: chapter
 *         in: query
 *         description: number of chapter
 *         required: true
 *         schema:
 *           type: string
 *           example: 1
 *       - name: verses
 *         in: query
 *         description: array of verses
 *         schema:
 *           type: array
 *           example: [1 ,3]
 *      tags:
 *        - git.door43
 *      responses:
 *        '200':
 *          description: Returns tn
 *
 *        '404':
 *          description: Bad request
 */

export default async function obsHandler(req, res) {
  const { repo, owner, commit, bookPath, chapter, step } = req.query
  let verses = req.query['verses[]'] || req.query.verses
  if (typeof verses === 'string') {
    verses = verses.split(',').map((el) => el.trim())
  }
  const url = `${
    process.env.NEXT_PUBLIC_NODE_HOST ?? 'https://git.door43.org'
  }/${owner}/${repo}/raw/commit/${commit}${bookPath.slice(1)}/${String(chapter).padStart(
    2,
    '0'
  )}.md`
  try {
    const _data = await axios.get(url)
    const jsonData = mdToJson(_data.data)

    const { additionalVerses, verseObjects, header } = jsonData
    const verseObjectsObs = [...additionalVerses, ...verseObjects].sort(
      (a, b) => a.verse - b.verse
    )
    const _verseObjects =
      verses && verses.length > 0
        ? verseObjectsObs.filter((el) => {
            return verses.includes(el.verse)
          })
        : verseObjectsObs

    return res.status(200).json({ verseObjects: _verseObjects, header })
  } catch (error) {
    return res.status(404).json({ error })
  }
}
