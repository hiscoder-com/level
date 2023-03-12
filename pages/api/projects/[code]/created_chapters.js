import { supabase } from 'utils/supabaseClient'

export default async function createdChaptersProjectHandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)

  let data = {}
  const {
    query: { code, chapters },
    method,
  } = req
  switch (method) {
    case 'GET':
      try {
        const { data: createdChaptersRaw, error } = await supabase
          .from('verses')
          .select('chapter_id,projects!inner(code)')
          .eq('projects.code', code)
          .in('chapter_id', chapters.split(','))

        if (error) throw error

        const createdChapters = new Set(createdChaptersRaw.map((el) => el.chapter_id))
        data = [...createdChapters]
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      res.status(200).json(data)
      break
    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
