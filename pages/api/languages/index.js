import { supabase } from '@/utils/supabaseClient'
/**
 * @swagger
 * /api/languages:
 *   get:
 *     description: Returns the all languages
 *     tags: [languages]
 *     responses:
 *       200:
 *         description: Returns array of languages
 *   post:
 *     description: Post new language
 *     tags: [languages]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: eng
 *         in: formData
 *         required: true
 *         type: string
 *       - name: code
 *         in: formData
 *         required: true
 *         type: string
 *       - name: orig_name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: is_gl
 *         in: formData
 *         required: true
 *         type: boolean
 *     responses:
 *       201:
 *         description: Returns new language
 */
// TODO  создание и редактирование языка нужно вернуть
export default async function languagesHandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)
  let data = {}
  const {
    body: { eng, code, orig_name, is_gl },
    method,
  } = req
  console.log(req)
  switch (method) {
    case 'GET':
      try {
        const { data: value, error } = await supabase.from('languages').select('*')
        if (error) throw error
        data = value
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      res.status(200).json(data)
      break
    case 'POST':
      try {
        const { data: value, error } = await supabase
          .from('languages')
          .insert([{ eng, code, orig_name, is_gl }])
        if (error) throw error
        data = value
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      res.status(201).json(data)
      break
    default:
      res.setHeader('Allow', ['GET'], ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
