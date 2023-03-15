import axios from 'axios'
import jsyaml from 'js-yaml'

import { filterNotes, tsvToJson } from 'utils/tsvHelper'

/**
 *  @swagger
 *  /api/git/tn:
 *    get:
 *      summary: Returns tn
 *      description: Returns tn
 *      parameters:
 *       - name: repo
 *         in: query
 *         description: code of repo
 *         required: true
 *         schema:
 *           type: string
 *           example: tn
 *       - name: commit
 *         in: query
 *         description: sha of commit
 *         required: true
 *         schema:
 *           type: string
 *           example: f36b5a19fc6ebbd37a7baba671909cf71de775bc
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
 *           example: ./en_tn_57-TIT.tsv
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
 *          description: Returns tn
 *
 *        '404':
 *          description: Bad request
 */

export default async function infoHandler(req, res) {
  const { repo, book, chapter } = req.query

  const manifestUrl = repo + '/raw/branch/master/manifest.yaml'

  const { data } = await axios.get(manifestUrl)

  const manifest = jsyaml.load(data, { json: true })

  const bookPath = manifest.projects.find((el) => el.identifier === book)?.path

  let url = ''
  if (bookPath.slice(0, 2) === './') {
    url = `${repo}/raw/master${bookPath.slice(1)}`
  } else {
    url = `${repo}/raw/master/${bookPath}`
  }

  try {
    const _data = await axios.get(url)
    const jsonData = tsvToJson(_data.data)
    const intros = {}

    jsonData?.forEach((el) => {
      const [chapterNote, verseNote] = el.Reference
        ? el.Reference.split(':')
        : [el.Chapter, el.Verse]
      // пропускаем, если это не наша глава и не введение
      if (chapterNote !== chapter && chapterNote !== 'front') {
        return
      }
      if (verseNote !== 'intro') {
        return
      }

      const newNote = {
        id: el.ID,
        text: el?.OccurrenceNote || el?.Note,
        title: chapterNote === 'front' ? 'bookIntro' : 'chapterIntro',
      }
      intros[newNote.title] = newNote.text
    })

    res.status(200).json(intros)
    return
  } catch (error) {
    res.status(404).json({ error })
    return
  }
}
