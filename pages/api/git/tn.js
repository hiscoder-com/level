import axios from 'axios'

import { tsvToJSON } from '@texttree/tn-quote'

/**
 *  @swagger
 *  /api/git/tn:
 *    get:
 *      summary: Returns tn
 *      description: Returns tn
 *      parameters:
 *       - name: repo
 *         in: query
 *         description: code of repo
 *         required: true
 *         schema:
 *           type: string
 *           example: tn
 *       - name: commit
 *         in: query
 *         description: sha of commit
 *         required: true
 *         schema:
 *           type: string
 *           example: f36b5a19fc6ebbd37a7baba671909cf71de775bc
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
 *           example: ./en_tn_57-TIT.tsv
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

export default async function tnHandler(req, res) {
  const { repo, owner, commit, bookPath, chapter } = req.query
  let verses = req.query['verses[]'] || req.query.verses
  if (typeof verses === 'string') {
    verses = verses.split(',').map((el) => el.trim())
  }
  let url = ''
  if (bookPath.slice(0, 2) === './') {
    url = `${
      process.env.NODE_HOST ?? 'https://git.door43.org'
    }/${owner}/${repo}/raw/commit/${commit}${bookPath.slice(1)}`
  } else {
    url = `${
      process.env.NODE_HOST ?? 'https://git.door43.org'
    }/${owner}/${repo}/raw/commit/${commit}/${bookPath}`
  }
  try {
    const _data = await axios.get(url)
    const jsonData = tsvToJSON(
      _data.data,
      ['Reference', 'Occurrence', 'Quote', 'ID', 'Note'],
      true
    )
    const data = jsonData?.filter((el) => {
      // пропускаем, если это не наша глава
      if (el.chapter !== chapter) {
        return false
      }
      if (el.verse.includes('intro')) {
        return false
      }

      if (verses && verses.length > 0) {
        if (verses.some((r) => el.verse.indexOf(r) >= 0)) {
          return true
        } else {
          return false
        }
      } else {
        return true
      }
    })
    return res.status(200).json(data)
  } catch (error) {
    return res.status(404).json({ error })
  }
}
