import supabaseApi from 'utils/supabaseServer'

export default async function createdChaptersProjectHandler(req, res) {
  let supabase
  try {
    supabase = await supabaseApi({ req, res })
  } catch (error) {
    return res.status(401).json({ error })
  }
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
        return res.status(404).json({ error })
      }
      return res.status(200).json(data)

    default:
      res.setHeader('Allow', ['GET'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
