import axios from 'axios'

import { tsvToJson } from 'utils/tsvHelper'

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
  const { repo, owner, commit, bookPath, language, book, chapter, step } = req.query
  let verses = req.query['verses[]'] || req.query.verses
  const url = `https://git.door43.org/${owner}/${language}_${repo}/raw/commit/${commit}${bookPath.slice(
    1
  )}`

  try {
    const _data = await axios.get(url)
    const jsonData = await tsvToJson(_data.data)
    const groupData = {}
    console.log(jsonData)
    const data =
      verses && verses.length > 0
        ? jsonData.filter((el) => {
            return el.Chapter === chapter && verses.includes(el.Verse)
          })
        : jsonData.filter((el) => {
            return el.Chapter === 'front'
          })

    data?.forEach((el) => {
      const tn = {
        id: el.ID,
        text: el.OccurrenceNote,
        title: el.GLQuote ? el.GLQuote : 'title',
      }
      if (!groupData[el.Verse]) {
        groupData[el.Verse] = [tn]
      } else {
        groupData[el.Verse].push(tn)
      }
    })
    res.status(200).json(groupData)
    return
  } catch (error) {
    res.status(404).json({ error })
    return
  }
}
