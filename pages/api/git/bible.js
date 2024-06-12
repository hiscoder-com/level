import axios from 'axios'
import usfm from 'usfm-js'

import { parseChapter } from 'utils/usfmHelper'
/**
 *  @swagger
 *  /api/git/bible:
 *    get:
 *      summary: Returns array of verses for specific chapter
 *      description: Returns array of verses  for specific chapter
 *      parameters:
 *       - name: repo
 *         in: query
 *         description: code of repo
 *         required: true
 *         schema:
 *           type: string
 *           example: onpu
 *       - name: commit
 *         in: query
 *         description: sha of commit
 *         required: true
 *         schema:
 *           type: string
 *           example: 209a944b5d9e6d15833a807d8fe771c9758c7139
 *       - name: owner
 *         in: query
 *         description: owner
 *         required: true
 *         schema:
 *           type: string
 *           example: DevleskoDrom
 *       - name: bookPath
 *         in: query
 *         description: path of the book
 *         required: true
 *         schema:
 *           type: string
 *           example: ./57-TIT.usfm
 *       - name: language
 *         in: query
 *         description: code of the language
 *         required: true
 *         schema:
 *           type: string
 *           example: uk
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
 *           example: 1
 *      tags:
 *        - git.door43
 *      responses:
 *        '200':
 *          description: Returns array of verses
 *
 *        '404':
 *          description: Bad request
 */

export default async function bibleHandler(req, res) {
  const { repo, owner, commit, bookPath, chapter } = req.query

  let verses = req.query['verses[]'] || req.query.verses
  if (typeof verses === 'string') {
    verses = verses.split(',').map((el) => el.trim())
  }
  const url = `${
    process.env.NODE_HOST ?? 'https://git.door43.org'
  }/${owner}/${repo}/raw/commit/${commit}${bookPath.slice(1)}`
  try {
    const _data = await axios.get(url)
    const jsonData = await usfm.toJSON(_data.data)

    const data = parseChapter(jsonData.chapters[chapter], verses).filter(
      (el) => el.verse !== 'front'
    )
    data.sort((a, b) => {
      const verseA = a.verse.match(/^\d+/)
      const verseB = b.verse.match(/^\d+/)
      return parseInt(verseA[0]) - parseInt(verseB[0])
    })

    return res.status(200).json({ verseObjects: data })
  } catch (error) {
    return res.status(404).json({ error })
  }
}
