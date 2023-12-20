import { supabaseService } from 'utils/supabaseService'
import supabaseApi from 'utils/supabaseServer'

function createCombinedData(uniqueBooks, booksData, chaptersData) {
  //Быстрый доступ к информации о книгах по их кодам.
  const bookInfoMap = booksData.reduce((acc, book) => {
    acc[book.book_code] = book
    return acc
  }, {})

  // Организация информации о главах книг по кодам книг и номерам глав.
  const bookChaptersMap = chaptersData.reduce((acc, chapter) => {
    const {
      book_code: bookCode,
      chapter_num: chapterNumber,
      verse_num,
      verse_text,
    } = chapter

    const verseObject = {
      verse: verse_num,
      text: verse_text,
    }

    if (!acc[bookCode]) {
      acc[bookCode] = {}
    }

    // Если нет главы, создаем ее
    if (!acc[bookCode][chapterNumber]) {
      acc[bookCode][chapterNumber] = {
        verseObjects: [verseObject],
      }
    } else {
      // Иначе, добавляем в существующий объект главы.
      acc[bookCode][chapterNumber].verseObjects.push(verseObject)
    }

    return acc
  }, {})

  return uniqueBooks.map((bookCode) => {
    const bookInfo = bookInfoMap[bookCode]
    const bookChapters = bookChaptersMap[bookCode]
    return createBookObject(bookCode, bookInfo, bookChapters)
  })
}

function createBookObject(bookCode, bookInfo, bookChapters) {
  const level_check = bookInfo?.level_checks
    ? { level: bookInfo.level_checks.level, url: bookInfo.level_checks.url }
    : null

  return {
    book_code: bookCode,
    level_check,
    chapters: bookChapters,
  }
}

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
        const combinedData = createCombinedData(uniqueBooks, booksData, chaptersData)
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
