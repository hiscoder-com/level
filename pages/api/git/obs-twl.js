import axios from 'axios'

import { tsvToJson, markRepeatedWords } from '@texttree/translation-words-helpers'

/**
 *  @swagger
 *  /api/git/obs-twl:
 *    get:
 *      summary: Returns obs-twl
 *      description: Returns obs-twl
 *      parameters:
 *       - name: repo
 *         in: query
 *         description: code of repo
 *         required: true
 *         schema:
 *           type: string
 *           example: obs-twl
 *       - name: commit
 *         in: query
 *         description: sha of commit
 *         required: true
 *         schema:
 *           type: string
 *           example: 80def64e540fed5da6394bd88ac4588a98c4a3ec
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
 *           example: ./twl_OBS.tsv
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
 *          description: Returns obs-twl
 *
 *        '404':
 *          description: Bad request
 */

export default async function twlHandler(req, res) {
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
    const markedWords = markRepeatedWords(jsonData, 'all')

    const data =
      verses && verses.length > 0
        ? markedWords.filter((wordObject) => {
            const [_chapter, _verse] = wordObject.Reference.split(':')
            return _chapter === chapter && verses.includes(_verse)
          })
        : markedWords.filter((wordObject) => {
            const [_chapter] = wordObject.Reference.split(':')
            return _chapter === chapter
          })

    return res.status(200).json(data)
  } catch (error) {
    return res.status(404).json({ error })
  }
}
