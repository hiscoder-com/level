import axios from "../../../lib/axios"

/**
 *  @swagger
 *  /api/git/ta:
 *    get:
 *      summary: Returns ta
 *      description: Returns ta
 *      parameters:
 *       - name: repo
 *         in: query
 *         description: code of repo
 *         required: true
 *         schema:
 *           type: string
 *           example: ru_ta
 *       - name: owner
 *         in: query
 *         description: owner
 *         required: true
 *         schema:
 *           type: string
 *           example: ru_gl
 *      tags:
 *        - git.door43
 *      responses:
 *        '200':
 *          description: Returns ta in zip file
 *
 *        '404':
 *          description: Bad request
 */

export default async function taHandler(req, res) {
  const { repo, owner, branch = 'master' } = req.query
  const url = `${
    process.env.NODE_HOST ?? 'https://git.door43.org'
  }/${owner}/${repo}/archive/${branch}.zip`

  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
    })
    const zipBuffer = response.data
    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', 'attachment; filename="archive.zip"')
    return res.status(200).send(zipBuffer)
  } catch (error) {
    return res.status(404).json({ error })
  }
}
