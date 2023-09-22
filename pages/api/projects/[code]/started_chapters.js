import supabaseApi from 'utils/supabaseServer'

export default async function startedChaptersProjectHandler(req, res) {
  let supabase
  try {
    supabase = await supabaseApi({ req, res })
  } catch (error) {
    return res.status(401).json({ error })
  }
  const {
    query: { code },
    method,
  } = req
  switch (method) {
    case 'GET':
      try {
        const { data: books, error: booksError } = await supabase
          .from('books')
          .select('id, projects!inner(code), code, chapters')
          .eq('projects.code', code)
        if (booksError) {
          throw booksError
        }
        const { data: startedChapters, error: startedChaptersError } = await supabase
          .from('chapters')
          .select('id,num,books(code),projects!inner(code),started_at,finished_at')
          .eq('projects.code', code)
          .not('started_at', 'is', null)
        if (startedChaptersError) {
          throw startedChaptersError
        }
        const chaptersMap = {}
        startedChapters.forEach((chapter) => {
          const bookCode = chapter.books.code
          const chapterNum = chapter.num
          chaptersMap[bookCode] = chaptersMap[bookCode] || {}
          chaptersMap[bookCode][chapterNum] = {
            id: chapter.id,
            started_at: chapter.started_at,
            finished_at: chapter.finished_at,
          }
        })
        const booksWithChapters = books.map((book) => {
          const chapters = book.chapters
          const code = book.code
          const bookChapters = chaptersMap[code] || {}

          return {
            ...book,
            chapters: Object.keys(chapters).reduce((acc, chapterNum) => {
              const id = bookChapters[chapterNum]?.id || null
              const started_at = bookChapters[chapterNum]?.started_at || null
              const finished_at = bookChapters[chapterNum]?.finished_at || null
              acc[chapterNum] = { id, started_at, finished_at }
              return acc
            }, {}),
          }
        })
        return res.status(200).json(booksWithChapters)
      } catch (error) {
        return res.status(404).json({ error })
      }

    default:
      res.setHeader('Allow', ['GET'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
