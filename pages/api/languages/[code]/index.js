import supabaseApi from 'utils/supabaseServer'

/**
 *  @swagger
 *  /api/languages/{code}:
 *    get:
 *      summary: Returns specific language
 *      description: Returns specific language
 *      parameters:
 *       - name: code
 *         in: path
 *         description: code of the language
 *         required: true
 *         schema:
 *           type: string
 *      tags:
 *        - languages
 *      responses:
 *        '200':
 *          description: Returns specific language
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Lang'
 *        '404':
 *          description: Bad request
 *      security:
 *        - ApiKeyAuth: []
 *    put:
 *      tags:
 *        - languages
 *      summary: Update an existing language
 *      parameters:
 *       - name: code
 *         in: path
 *         description: code of the language
 *         required: true
 *         schema:
 *           type: string
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                  eng:
 *                    type: string
 *                    description: code of language in English
 *                    example: ru
 *                  orig_name:
 *                    type: string
 *                    description: original name of Language
 *                    example: русский
 *                  is_gl:
 *                    type: boolean
 *                    description: Is this language GL or not
 *                    example: true
 *      responses:
 *        '201':
 *          description: Returns updated language
 *          content:
 *            application/json:
 *              schema:
 *               $ref: '#/components/schemas/Lang'
 *        '404':
 *          description: Bad request
 *      security:
 *        - ApiKeyAuth: []
 *    delete:
 *      tags:
 *        - languages
 *      summary: Delete an existing language
 *      parameters:
 *       - name: code
 *         in: path
 *         description: code of the language
 *         required: true
 *         schema:
 *           type: string
 *      responses:
 *        '200':
 *          description: Id of deleted item
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  id:
 *                    type: integer
 *                    example: 28
 *        '204':
 *          description: No content
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
    query: { code },
    body: { eng, orig_name, is_gl },
    method,
  } = req
  switch (method) {
    case 'GET':
      try {
        const { data: value, error } = await supabase
          .from('languages')
          .select('*')
          .match({ code: code })
          .limit(1)
          .maybeSingle()
        if (error) throw error
        data = value
      } catch (error) {
        return res.status(404).json({ error })
      }
      return res.status(200).json(data)
    case 'PUT':
      try {
        const { data: value, error } = await supabase
          .from('languages')
          .update([{ eng, orig_name, is_gl }])
          .match({ code: code })
          .select()
        if (error) throw error
        data = value
      } catch (error) {
        return res.status(404).json({ error })
      }
      return res.status(201).json(data)

    case 'DELETE':
      try {
        const { data: value, error } = await supabase
          .from('languages')
          .delete({ returning: 'representation', count: 'estimated' })
          .match({ code: code })
          .select()
        if (error) throw error
        data = value
      } catch (error) {
        return res.status(404).json({ error })
      }
      if (data.length === 0) {
        return res.status(204).end()
      }
      return res.status(200).json(data?.code)

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
