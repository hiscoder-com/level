import axios from 'axios'

import { tsvToJson } from '@texttree/translation-words-helpers'
import { filterNotes } from 'utils/helper'

/**
 *  @swagger
 *  /api/git/obs-tn:
 *    get:
 *      summary: Returns obs-tn
 *      description: Returns obs-tn
 *      parameters:
 *       - name: repo
 *         in: query
 *         description: code of repo
 *         required: true
 *         schema:
 *           type: string
 *           example: obs-tn
 *       - name: commit
 *         in: query
 *         description: sha of commit
 *         required: true
 *         schema:
 *           type: string
 *           example: cc11b0036f379e47fd99ada8a82e15520ac63474
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
 *           example: ./tn_OBS.tsv
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
 *          description: Returns tn
 *
 *        '404':
 *          description: Bad request
 */

export default async function obsTnHandler(req, res) {
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
    const jsonData = tsvToJson(_data.data)
    const wholeChapter = {}
    const dividedChapter = {}

    jsonData?.forEach((el) => {
      const [chapterNote, verseNote] = el.Reference.split(':')

      if (chapterNote !== chapter) {
        return
      }
      const newNote = {
        id: el.ID,
        text: el.Note,
        title: el.Quote,
      }
      if (verses && verses.length > 0 && verses.includes(verseNote)) {
        filterNotes(newNote, verseNote, dividedChapter)
        return
      }
      filterNotes(newNote, verseNote, wholeChapter)
    })
    const data = verses && verses.length > 0 ? dividedChapter : wholeChapter

    return res.status(200).json(data)
  } catch (error) {
    return res.status(404).json({ error })
  }
}
