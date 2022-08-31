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

const verses = ['1', '2', '4', '5']
export default async function bibleHandler(req, res) {
  // if (!req.headers.token) {
  //   res.status(401).json({ error: 'Access denied!' })
  // }
  //
  let data = {}
  const {
    query: { repo, owner, commit, bookPath, language, chapter },
  } = req
  console.log(req.query)

  const url = `https://git.door43.org/${owner}/${language}_${repo}/raw/commit/${commit}${bookPath.slice(
    1
  )}`
  try {
    const _data = await axios.get(url)
    // await console.log(_data)
    const jsonData = await tsvToJson(_data.data)
    // console.log(jsonData)
    // data = jsonData
    // console.log(jsonData.chapters[1][1].verseObjects)
    // if (error) throw error

    const test = jsonData.filter((el) => {
      return el.Chapter === chapter && verses.includes(el.Verse)
    })

    console.log(test)
    //
    res.status(200).json(test)
    return
  } catch (error) {
    res.status(404).json({ error })
    return
  }
}
