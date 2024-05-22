import axios from 'axios'

const AQUIFER_API_KEY = process.env.API_KEY_AQUIFER

export default async function handler(req, res) {
  const { book_code, chapter_num, verse_num } = req.query
  try {
    const { limit = 10, offset = 0, language_code, resource_type, query } = req.query
    const searchParams = {
      bookCode: book_code,
      startChapter: query ? 0 : parseInt(chapter_num),
      endChapter: query ? 0 : parseInt(chapter_num),
      startVerse: query ? 0 : parseInt(verse_num),
      endVerse: query ? 0 : parseInt(verse_num),
      languageCode: language_code,
      resourceType: resource_type,
      limit,
      offset,
    }
    if (query) {
      searchParams.query = query
    }

    const response = await axios.get('https://api.aquifer.bible/resources/search', {
      params: searchParams,
      headers: { 'api-key': AQUIFER_API_KEY },
    })
    res.status(200).json(response.data)
  } catch (error) {
    res.status(400).json(error)
  }
}
