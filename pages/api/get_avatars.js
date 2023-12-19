import { supabaseService } from 'utils/supabaseService'

export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'GET':
      try {
        const { data, error } = await supabaseService.storage.from('avatars').list()

        if (error) {
          console.error('Error fetching avatars:', error)
          return res.status(500).json({ error: 'Internal Server Error' })
        }

        const avatarUrls = await Promise.all(
          data.map(async (item) => {
            const { data: fileData, error: fileError } = supabaseService.storage
              .from('avatars')
              .getPublicUrl(item.name)

            if (fileError) {
              console.error(`Error fetching URL for ${item.name}:`, fileError)
              return null
            }
            return fileData.publicUrl
          })
        )

        return res.status(200).json({ data: avatarUrls })
      } catch (error) {
        console.error('Server error:', error)
        return res.status(500).json({ error: 'Internal Server Error' })
      }

    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
