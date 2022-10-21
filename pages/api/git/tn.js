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
const filterNotes = (note, newNote, notes, repeatedNotes) => {
  if (repeatedNotes.includes(note.GLQuote)) {
    newNote['repeat'] = true
  } else {
    repeatedNotes.push(note.GLQuote)
  }
  if (!notes[note.Verse]) {
    notes[note.Verse] = [newNote]
  } else {
    notes[note.Verse].push(newNote)
  }
}

export default async function tnHandler(req, res) {
  const { repo, owner, commit, bookPath, book, chapter, step } = req.query
  let verses = req.query['verses[]'] || req.query.verses

  const url = `https://git.door43.org/${owner}/${repo}/raw/commit/${commit}${bookPath.slice(
    1
  )}`

  try {
    const _data = await axios.get(url)
    const jsonData = tsvToJson(_data.data)
    const wholeChapter = {}
    const dividedChapter = {}
    const repeatedWhole = []
    const repeatedDivided = []

    jsonData?.forEach((el) => {
      if (el.Chapter !== chapter) {
        return
      }
      const newNote = {
        id: el.ID,
        text: el.OccurrenceNote,
        title: el.GLQuote ? el.GLQuote : 'title',
      }
      if (verses && verses.length > 0 && verses.includes(el.Verse)) {
        filterNotes(el, newNote, dividedChapter, repeatedDivided)
        return
      }
      filterNotes(el, newNote, wholeChapter, repeatedWhole)
    })
    const data = verses && verses.length > 0 ? dividedChapter : wholeChapter

    res.status(200).json(data)
    return
  } catch (error) {
    res.status(404).json({ error })
    return
  }
}
