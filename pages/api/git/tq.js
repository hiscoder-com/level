import axios from 'axios'

import { tsvToJson } from '@texttree/translation-words-helpers'

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
  const { repo, owner, commit, bookPath, chapter } = req.query

  let verses = req.query['verses[]'] || req.query.verses
  if (typeof verses === 'string') {
    verses = verses.split(',').map((el) => el.trim())
  }
  const url = `${
    process.env.NEXT_PUBLIC_NODE_HOST ?? 'https://git.door43.org'
  }/${owner}/${repo}/raw/commit/${commit}${bookPath.slice(1)}`

  try {
    const _data = await axios.get(url)
    const jsonData = tsvToJson(_data.data)
    const rangeVerses = []
    const currentChapter = jsonData.filter((el) => {
      const [chapterQuestion, verseQuestion] = el.Reference.split(':')
      if (chapterQuestion !== chapter) {
        return
      }

      const range = verseQuestion.split('-')

      if (range.length > 1) {
        for (let i = parseInt(range[0]); i <= parseInt(range[1]); i++) {
          if (
            !verses ||
            (verses && (verses.length === 0 || verses.includes(String(i))))
          ) {
            rangeVerses.push({ ...el, Reference: chapterQuestion + ':' + i })
          }
        }
        return
      }

      if (verses && verses.length > 0 && !verses.includes(verseQuestion)) {
        return
      }

      return true
    })

    const data = [...currentChapter, ...rangeVerses]

    const questions = {}
    data?.forEach((el) => {
      const verse = el.Reference.split(':').slice(-1)[0]
      const tq = { id: el.ID, title: el.Question, text: el.Response }
      if (!questions[verse]) {
        questions[verse] = [tq]
      } else {
        questions[verse].push(tq)
      }
    })

    return res.status(200).json(questions)
  } catch (error) {
    return res.status(404).json({ error })
  }
}
