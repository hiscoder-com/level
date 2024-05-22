import axios from 'axios'

const AQUIFER_API_KEY = process.env.API_KEY_AQUIFER

export default async function handler(req, res) {
  const { id } = req.query

  if (!AQUIFER_API_KEY) {
    return res.status(500).json({ error: 'API key is missing' })
  }

  try {
    const response = await axios.get(`https://api.aquifer.bible/resources/${id}`, {
      headers: {
        'api-key': AQUIFER_API_KEY,
      },
    })

    if (!response.data) {
      return res.status(404).json({ error: 'Resource not found' })
    }

    res.status(200).json(response.data)
  } catch (error) {
    console.error('Error fetching note from Aquifer API:', error)

    if (error.response) {
      if (error.response.status === 400) {
        return res
          .status(400)
          .json({ error: 'Bad Request', details: error.response.data })
      } else if (error.response.status === 404) {
        return res
          .status(404)
          .json({ error: 'Resource not found', details: error.response.data })
      }
    }

    return res.status(500).json({ error: 'Internal server error' })
  }
}
