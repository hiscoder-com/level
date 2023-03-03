import axios from 'axios'

import { filterNotes, tsvToJson } from 'utils/tsvHelper'

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
  const url = `https://git.door43.org/${owner}/${repo}/raw/commit/${commit}${bookPath.slice(
    1
  )}`

  try {
    const _data = await axios.get(url)
    const jsonData = tsvToJson(_data.data)
    const wholeChapter = {}
    const dividedChapter = {}

    jsonData?.forEach((el) => {
      // пропускаем, если это не наша глава и не введение
      if (el.Chapter !== chapter && el.Chapter !== 'front') {
        return
      }

      // создаем экземпляр заметки
      // Если это введение к главе - заголовок intro
      // Если введение к книге - заголовок front
      const newNote = {
        id: el.ID,
        text: el.OccurrenceNote,
        title: el.Verse === 'intro' ? 'intro' : el.GLQuote ? el.GLQuote : el.OrigQuote,
      }
      if (el.Chapter === 'front') {
        newNote['title'] = 'front'
      }
      // если надо получить определенные стихи то используем dividedChapter, иначе wholeChapter
      // в каждый объект надо добавить так же введения
      if (
        verses &&
        verses.length > 0 &&
        (verses.includes(el.Verse) || el.Verse === 'intro')
      ) {
        filterNotes(newNote, el.Verse, dividedChapter)
      } else {
        filterNotes(newNote, el.Verse, wholeChapter)
      }
    })
    const data = verses && verses.length > 0 ? dividedChapter : wholeChapter
    res.status(200).json(data)
    return
  } catch (error) {
    res.status(404).json({ error })
    return
  }
}
