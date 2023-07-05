import axios from 'axios'

/**
 *  @swagger
 *  /api/git/tw:
 *    get:
 *      summary: Returns tw
 *      description: Returns tw
 *      parameters:
 *       - name: repo
 *         in: query
 *         description: code of repo
 *         required: true
 *         schema:
 *           type: string
 *           example: ru_tw
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
 *          description: Returns tw in zip file
 *
 *        '404':
 *          description: Bad request
 */

export default async function twHandler(req, res) {
  const { repo, owner, branch = 'master' } = req.query
  const url = `${
    process.env.NEXT_PUBLIC_NODE_HOST ?? 'https://git.door43.org'
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
