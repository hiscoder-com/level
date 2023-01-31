import axios from 'axios'

import { tsvToJson } from 'utils/tsvHelper'
import { uniqueFilterInBook, uniqueFilter, getListWordsReference } from 'utils/helper'

/**
 *  @swagger
 *  /api/git/twl:
 *    get:
 *      summary: Returns twl
 *      description: Returns twl
 *      parameters:
 *       - name: repo
 *         in: query
 *         description: code of repo
 *         required: true
 *         schema:
 *           type: string
 *           example: twl
 *       - name: commit
 *         in: query
 *         description: sha of commit
 *         required: true
 *         schema:
 *           type: string
 *           example: 17383807b558d6a7268cb44a90ac105c864a2ca1
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
 *           example: ./twl_TIT.tsv
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
 *          description: Returns twl
 *
 *        '404':
 *          description: Bad request
 */

export default async function twlHandler(req, res) {
  const { repo, owner, commit, bookPath, book, chapter, step } = req.query

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
    const uniqueWordsBook = getListWordsReference(jsonData)
    const data =
      verses && verses.length > 0
        ? jsonData.filter((el) => {
            const [_chapter, _verse] = el.Reference.split(':')
            return _chapter === chapter && verses.includes(_verse)
          })
        : jsonData.filter((el) => {
            const [_chapter] = el.Reference.split(':')
            return _chapter === chapter
          })

    const promises = data.map(async (el) => {
      const url = `https://git.door43.org/${owner}/${repo.slice(
        0,
        -1
      )}/raw/branch/master/${el.TWLink.split('/').slice(-3).join('/')}.md`
      const res = await axios.get(url)

      const splitter = res.data.search('\n')
      return {
        id: el.ID,
        reference: el.Reference,
        title: res.data.slice(0, splitter),
        text: res.data.slice(splitter),
        url: el.TWLink,
      }
    })
    const words = await Promise.all(promises)
    const finalData = {}
    const chunkUnique = {}
    let verseUnique = {}

    words?.forEach((el) => {
      const repeatedInChunk = uniqueFilter(chunkUnique, el.url, el.title)
      let repeatedInVerse = uniqueFilter(verseUnique, el.url, el.title)

      const wordObject = {
        id: el.id,
        title: el.title,
        text: el.text,
        url: el.url,
        repeatedInChunk,
      }
      const repeatedInBook = uniqueFilterInBook(uniqueWordsBook, el, wordObject)

      const verse = el.reference.split(':').slice(-1)[0]

      if (!finalData[verse]) {
        verseUnique = {}
        repeatedInVerse = uniqueFilter(verseUnique, el.url, el.title)
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
