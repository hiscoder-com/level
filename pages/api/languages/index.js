import supabaseApi from 'utils/supabaseServer'
/**
 * @swagger
 * components:
 *   schemas:
 *     Lang:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: id of new language
 *           example: 28
 *         eng:
 *           type: string
 *           description: code of language in English
 *           example: ru
 *         code:
 *           type: string
 *           description: code of language
 *           example: ru
 *         orig_name:
 *           type: string
 *           description: original name of Language
 *           example: русский
 *         is_gl:
 *           type: boolean
 *           description: Is this language GL or not
 *           example: true
 */

/**
 *  @swagger
 *  /api/languages:
 *    get:
 *      summary: Returns all languages
 *      description: Returns the all languages
 *      tags:
 *        - languages
 *      responses:
 *        '200':
 *          description: Returns array of languages
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/Lang'
 *        '404':
 *          description: Bad request
 *      security:
 *        - ApiKeyAuth: []
 *    post:
 *      tags:
 *        - languages
 *      summary: Add a new language
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Lang'
 *      responses:
 *        '201':
 *          description: Returns new language
 *          content:
 *            application/json:
 *              schema:
 *               $ref: '#/components/schemas/Lang'
 *        '404':
 *          description: Bad request
 *      security:
 *        - ApiKeyAuth: []
 */

export default async function languagesHandler(req, res) {
  let supabase
  try {
    supabase = await supabaseApi({ req, res })
  } catch (error) {
    return res.status(401).json({ error })
  }
  let data = {}
  const {
    body: { eng, code, origName: orig_name, isGl: is_gl, isRtl: is_rtl },
    method,
  } = req
  switch (method) {
    case 'GET':
      try {
        const { data: value, error } = await supabase
          .from('languages')
          .select('*')
          .order('id', { ascending: false })
        if (error) throw error
        data = value
      } catch (error) {
        return res.status(404).json({ error })
      }
      return res.status(200).json(data)

    case 'POST':
      try {
        const { data: value, error } = await supabase
          .from('languages')
          .insert([{ eng, code, orig_name, is_gl, is_rtl }])
          .select()
        if (error) throw error
        data = value
      } catch (error) {
        return res.status(404).json({ error })
      }
      return res.status(201).json(data)

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
