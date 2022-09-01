import axios from 'axios'
import { tsvToJson } from '@/utils/tsvHelper'

/**
 *  @swagger
 *  /api/git/tq:
 *    get:
 *      summary: Returns tq
 *      description: Returns tq
 *      parameters:
 *       - name: repo
 *         in: query
 *         description: code of repo
 *         required: true
 *         schema:
 *           type: string
 *           example: tq
 *       - name: commit
 *         in: query
 *         description: sha of commit
 *         required: true
 *         schema:
 *           type: string
 *           example: b09890c9166ba08d734c4acc9b232ad5f9c7a4f5
 *       - name: owner
 *         in: query
 *         description: owner
 *         required: true
 *         schema:
 *           type: string
 *           example: unfoldingWord
 *       - name: bookPath
 *         in: query
 *         description: path of the book
 *         required: true
 *         schema:
 *           type: string
 *           example: ./tq_TIT.tsv
 *       - name: language
 *         in: query
 *         description: code of the language
 *         required: true
 *         schema:
 *           type: string
 *           example: en
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
 *          description: Returns tq
 *
 *        '404':
 *          description: Bad request
 */

export default async function tqHandler(req, res) {
  const { repo, owner, commit, bookPath, language, book, chapter, step } = req.query

  let verses = req.query['verses[]'] || req.query.verses
  const url = `https://git.door43.org/${owner}/${language}_${repo}/raw/commit/${commit}${bookPath.slice(
    1
  )}`

  try {
    const _data = await axios.get(url)
    const jsonData = await tsvToJson(_data.data)
    const data =
      verses && verses.length > 0
        ? jsonData.filter((el) => {
            const [chapterQuestion, verseQuestion] = el.Reference.split(':')
            return chapterQuestion === chapter && verses.includes(verseQuestion)
          })
        : jsonData
    res.status(200).json(data)
    return
  } catch (error) {
    res.status(404).json({ error })
    return
  }
}
