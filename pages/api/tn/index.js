import axios from 'axios'
// import usfm from 'usfm-js'

/**
 *  @swagger
 *  /api/bible/{repo}:
 *    get:
 *      summary: Returns specific language
 *      description: Returns specific language
 *      parameters:
 *       - name: repo
 *         in: path
 *         description: code of the language
 *         required: true
 *         schema:
 *           type: string
 *       - name: commit
 *         in: query
 *         description: code of the language
 *         required: true
 *         schema:
 *           type: string
 *       - name: owner
 *         in: query
 *         description: code of the language
 *         required: true
 *         schema:
 *           type: string
 *       - name: bookPath
 *         in: query
 *         description: code of the language
 *         required: true
 *         schema:
 *           type: string
 *       - name: language
 *         in: query
 *         description: code of the language
 *         required: true
 *         schema:
 *           type: string
 *      tags:
 *        - bible
 *      responses:
 *        '200':
 *          description: Returns usfm object
 *
 *        '404':
 *          description: Bad request
 *      security:
 *        - ApiKeyAuth: []
 */

function tsvToJson(tsv) {
  const result = []

  if (tsv) {
    const lines = tsv.trim().split('\n')
    const headers = lines[0].split('\t')

    for (let i = 1; i < lines.length; i++) {
      const obj = {}
      const currentline = lines[i].split('\t')

      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentline[j]
      }

      result.push(obj)
    }
  }

  return result
}

export default async function bibleHandler(req, res) {
  const { repo, owner, commit, bookPath, language, book, chapter, step } = req.query
  let verses = req.query['verses[]']
  const url = `https://git.door43.org/${owner}/${language}_${repo}/raw/commit/${commit}${bookPath.slice(
    1
  )}`

  try {
    const _data = await axios.get(url)

    const jsonData = await tsvToJson(_data.data)

    const test =
      verses && verses.length > 0
        ? jsonData.filter((el) => {
            return el.Chapter === chapter && verses.includes(el.Verse)
          })
        : jsonData

    res.status(200).json(test)
    return
  } catch (error) {
    res.status(404).json({ error })
    return
  }
}
