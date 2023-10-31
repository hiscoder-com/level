import { supabaseService } from 'utils/supabaseService'
import supabaseApi from 'utils/supabaseServer'

export default async function ChaptersTranslateHandler(req, res) {
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
        const { data: booksData, error: booksError } = await supabaseService.rpc(
          'get_books_not_null_level_checks',
          {
            project_code: code,
          }
        )
        const { data: chaptersData, error: chaptersError } = await supabaseService.rpc(
          'find_books_with_chapters_and_verses',
          {
            project_code: code,
          }
        )

        if (chaptersError || booksError) {
          return res.status(404).json({ booksError, chaptersError })
        }

        const uniqueBooks = [...new Set(chaptersData.map((chapter) => chapter.book_code))]

        const combinedData = uniqueBooks.map((bookCode) => {
          const bookInfo = booksData.find((book) => book.book_code === bookCode)

          const bookChapters = chaptersData
            .filter((chapter) => chapter.book_code === bookCode)
            .map((chapter) => ({
              verse_num: chapter.verse_num,
              verse_text: chapter.verse_text,
            }))

          if (!bookInfo || !bookInfo.level_checks) {
            return {
              book_code: bookCode,
              level_check: null,
              chapters: Object.fromEntries(
                bookChapters.map((chapter) => [chapter.verse_num, chapter])
              ),
            }
          }

          return {
            book_code: bookCode,
            level_check: {
              level: bookInfo.level_checks.level,
              url: bookInfo.level_checks.url,
            },
            chapters: Object.fromEntries(
              bookChapters.map((chapter) => [chapter.verse_num, chapter])
            ),
          }
        })

        return res.status(200).json(combinedData)
      } catch (error) {
        console.error('Error:', error)
        return res.status(404).json({ error })
      }
    default:
      res.setHeader('Allow', ['GET'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
