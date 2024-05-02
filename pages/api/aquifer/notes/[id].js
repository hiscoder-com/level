import axios from 'axios'

const AQUIFER_API_KEY = process.env.NEXT_API_KEY_AQUIFER

export default async function handler(req, res) {
  const { id } = req.query

  try {
    const response = await axios.get(`https://api.aquifer.bible/resources/${id}`, {
      headers: {
        'api-key': AQUIFER_API_KEY,
      },
    })

    res.status(200).json(response.data)
  } catch (error) {
    console.error('Error fetching note from Aquifer API:', error)
  }
}
