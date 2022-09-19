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
  const { repo, owner, commit, bookPath, language, book, chapter, step } = req.query

  let verses = req.query['verses[]'] || req.query.verses
  const url = `https://git.door43.org/${owner}/${language}_${repo}/raw/commit/${commit}${bookPath.slice(
    1
  )}`
  try {
    const _data = await axios.get(url)

    const jsonData = await usfm.toJSON(_data.data)

    const data = await parseChapter(jsonData.chapters[chapter], verses)

    res.status(200).json({ verseObjects: data })
    return
  } catch (error) {
    res.status(404).json({ error })
    return
  }
}
