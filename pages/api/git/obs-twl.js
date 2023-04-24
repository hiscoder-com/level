import axios from 'axios'

import { tsvToJson } from 'utils/tsvHelper'
import { uniqueFilterInBook, getListWordsReference } from 'utils/helper'

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
    NEXT_PUBLIC_NODE_HOST ?? 'https://git.door43.org'
  }/${owner}/${repo}/raw/commit/${commit}${bookPath.slice(1)}`
  try {
    const _data = await axios.get(url)
    const jsonData = tsvToJson(_data.data)
    const uniqueWordsBook = getListWordsReference(jsonData)
    const jsonDataFiltered =
      verses && verses.length > 0
        ? jsonData.filter((wordObject) => {
            const [_chapter, _verse] = wordObject.Reference.split(':')
            return _chapter === chapter && verses.includes(_verse)
          })
        : jsonData.filter((wordObject) => {
            const [_chapter] = wordObject.Reference.split(':')
            return _chapter === chapter
          })

    const promises = jsonDataFiltered.map(async (wordObject) => {
      const url = `${NEXT_PUBLIC_NODE_HOST ?? 'https://git.door43.org'}/${owner}/${repo
        .slice(0, -1)
        .replace('obs-', '')}/raw/branch/master/${wordObject.TWLink.split('/')
        .slice(-3)
        .join('/')}.md`
      const res = await axios.get(url)
      const splitter = res.data.search('\n')
      return {
        id: wordObject.ID,
        reference: wordObject.Reference,
        title: res.data.slice(0, splitter),
        text: res.data.slice(splitter),
        url: wordObject.TWLink,
      }
    })
    const words = await Promise.all(promises)
    const finalData = {}
    let verseUnique = {}

    words?.forEach((word) => {
      let repeatedInVerse = word.url in verseUnique
      if (!repeatedInVerse) {
        verseUnique[word.url] = word.title
      }

      const wordObject = {
        id: word.id,
        title: word.title,
        text: word.text,
        url: word.url,
      }
      const repeatedInBook = uniqueFilterInBook(uniqueWordsBook, word, wordObject)

      const verse = word.reference.split(':').slice(-1)[0]

      if (!finalData[verse]) {
        verseUnique = {}
        repeatedInVerse = false
        verseUnique[word.url] = word.title
        finalData[verse] = [{ ...wordObject, repeatedInVerse, repeatedInBook }]
      } else {
        finalData[verse].push({ ...wordObject, repeatedInVerse, repeatedInBook })
      }
    })

    res.status(200).json(finalData)
    return
  } catch (error) {
    res.status(404).json({ error })
    return
  }
}
