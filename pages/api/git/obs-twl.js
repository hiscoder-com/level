import axios from 'axios'

import { tsvToJson } from 'utils/tsvHelper'

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
  const { repo, owner, commit, bookPath, language, book, chapter, step } = req.query
  let verses = req.query['verses[]'] || req.query.verses
  const url = `https://git.door43.org/${owner}/${language}_${repo}/raw/commit/${commit}${bookPath.slice(
    1
  )}`
  try {
    const _data = await axios.get(url)
    const jsonData = tsvToJson(_data.data)
    const test =
      verses && verses.length > 0
        ? jsonData.filter((el) => {
            const [chapterQuestion, verseQuestion] = el.Reference.split(':')
            return chapterQuestion === chapter && verses.includes(verseQuestion)
          })
        : jsonData.filter((el) => {
            const [chapterQuestion] = el.Reference.split(':')
            return chapterQuestion === chapter
          })
    const promises = test.map(async (el) => {
      const url = `https://git.door43.org/${owner}/${language}_tw/raw/branch/master/${el.TWLink.split(
        '/'
      )
        .slice(-3)
        .join('/')}.md`
      const res = await axios.get(url)
      const splitter = res.data.search('\n')
      return {
        reference: el.Reference,
        title: res.data.slice(0, splitter),
        text: res.data.slice(splitter),
      }
    })
    const words = await Promise.all(promises)

    const groupData = {}
    let countID = 0

    words?.forEach((el) => {
      const id = `${el.reference}_${new Date().getTime()}_${countID}`
      countID++
      const twl = { id, title: el.title, text: el.text }
      const verse = el.reference.split(':').slice(-1)[0]
      if (!groupData[verse]) {
        groupData[verse] = [twl]
      } else {
        groupData[verse].push(twl)
      }
    })

    res.status(200).json(groupData)
    return
  } catch (error) {
    res.status(404).json({ error })
    return
  }
}
