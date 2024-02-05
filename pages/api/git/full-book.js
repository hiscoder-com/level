import axios from 'axios'

import { Proskomma } from 'proskomma-core'
const query = `{
  id
  processor
    documents {
      cvIndexes {
        chapter
        verses {
          verse {
            verseRange
            text
              }
            }
          }
        }
      }`
const pk = new Proskomma()

/**
 *  @swagger
 *  /api/git/bible:
 *    get:
 *      summary: Returns array of verses for specific chapter
 *      description: Returns array of verses  for specific chapter
 *      parameters:
 *       - name: repo
 *         in: query
 *         description: code of repo
 *         required: true
 *         schema:
 *           type: string
 *           example: onpu
 *       - name: commit
 *         in: query
 *         description: sha of commit
 *         required: true
 *         schema:
 *           type: string
 *           example: 209a944b5d9e6d15833a807d8fe771c9758c7139
 *       - name: owner
 *         in: query
 *         description: owner
 *         required: true
 *         schema:
 *           type: string
 *           example: DevleskoDrom
 *       - name: bookPath
 *         in: query
 *         description: path of the book
 *         required: true
 *         schema:
 *           type: string
 *           example: ./57-TIT.usfm
 *       - name: language
 *         in: query
 *         description: code of the language
 *         required: true
 *         schema:
 *           type: string
 *           example: uk
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
 *           example: 1
 *      tags:
 *        - git.door43
 *      responses:
 *        '200':
 *          description: Returns array of verses
 *
 *        '404':
 *          description: Bad request
 */

export default async function bibleHandler(req, res) {
  const { repo, owner, commit, bookPath } = req.query

  const url = `${
    process.env.NODE_HOST ?? 'https://git.door43.org'
  }/${owner}/${repo}/raw/commit/${commit}${bookPath.slice(1)}`
  try {
    const _data = await axios.get(url)
    if (!Object.keys(pk.documents).length) {
      pk.importDocument({ lang: 'eng', abbr: 'ult' }, 'usfm', _data?.data)
    }

    const _res = pk.gqlQuerySync(query)
    console.log(_res)
    const chaptersRefactor = () => {
      if (_res) {
        const newarray = _res.data.documents[0].cvIndexes.map((chapter) => {
          const verses = chapter.verses.map((verse) => ({
            num: verse?.verse[0]?.verseRange || '0',
            text: verse?.verse[0]?.text || 'none',
          }))
          return { num: chapter.chapter, verses }
        })
        return newarray
      }
    }
    const chapters = chaptersRefactor()

    return res.status(200).json({ data: chapters })
  } catch (error) {
    console.log(error)
    return res.status(404).json({ error })
  }
}
