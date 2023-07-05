import axios from 'axios'

import { tsvToJson } from '@texttree/translation-words-helpers'

/**
 *  @swagger
 *  /api/git/obs-tq:
 *    get:
 *      summary: Returns obs tq
 *      description: Returns obs tq
 *      parameters:
 *       - name: repo
 *         in: query
 *         description: code of repo
 *         required: true
 *         schema:
 *           type: string
 *           example: obs-tq
 *       - name: commit
 *         in: query
 *         description: sha of commit
 *         required: true
 *         schema:
 *           type: string
 *           example: b160230943b89798d7a6d4693c477c621601e34c
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
 *           example: ./tq_OBS.tsv
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

export default async function obsTQHandler(req, res) {
  const { repo, owner, commit, bookPath, chapter, step } = req.query
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
    const questions = {}
    jsonData?.forEach((el) => {
      const [chapterQuestion, verseQuestion] = el.Reference.split(':')
      if (
        chapterQuestion !== chapter ||
        (verses?.length && !verses.includes(verseQuestion))
      ) {
        return
      }
      const tq = { id: el.ID, title: el.Question, text: el.Response }

      if (!questions[verseQuestion]) {
        questions[verseQuestion] = [tq]
      } else {
        questions[verseQuestion].push(tq)
      }
    })
    return res.status(200).json(questions)
  } catch (error) {
    return res.status(404).json({ error })
  }
}
