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
    const { data } = await axios.get('https://api.aquifer.bible/resources/search', {
      params: searchParams,
      headers: { 'api-key': AQUIFER_API_KEY },
    })
    if (data.items && data.items.length > 0) {
      const contentIds = data.items.map((item) => item.id)
      const contentRequests = contentIds.map((contentId) =>
        axios
          .get(`https://api.aquifer.bible/resources/${contentId}`, {
            headers: { 'api-key': AQUIFER_API_KEY },
          })
          .catch((error) => {
            console.error('Error fetching content for ID:', contentId, error)
            return null
          })
      )
      const contentResponses = await Promise.all(contentRequests)

      const results = contentResponses.map((response) => ({
        url: response.data.content.url,
        name: response.data.name,
        id: response.data.id,
      }))
      res.status(200).json({ ...data, items: results })
    } else {
      res.status(200).json({ ...data, items: [] })
    }
  } catch (error) {
    res.status(400).json(error)
  }
}
