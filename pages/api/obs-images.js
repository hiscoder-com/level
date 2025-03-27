import { supabaseService } from 'utils/supabaseService'

export default async function handler(req, res) {
  const { method } = req

  const handleError = (error, errorMessage) => {
    console.error(errorMessage, error)
    res.status(500).json({ error: 'Internal Server Error' })
  }

  switch (method) {
    case 'GET':
      try {
        const { data: fileData, error: fileError } = supabaseService.storage
          .from('obs-images')
          .getPublicUrl('obs-images-360px.zip')

        if (fileError) {
          console.error(`Error fetching URL for obs-images:`, fileError)
          return null
        }

        return res.status(200).json({ data: fileData?.publicUrl })
      } catch (error) {
        return handleError(error, 'Server error:')
      }

    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
