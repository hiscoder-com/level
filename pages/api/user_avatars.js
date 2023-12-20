import { supabaseService } from 'utils/supabaseService'

export default async function handler(req, res) {
  const { method, body } = req

  const handleError = (error, errorMessage) => {
    console.error(errorMessage, error)
    res.status(500).json({ error: 'Internal Server Error' })
  }

  switch (method) {
    case 'GET':
      try {
        const { data, error } = await supabaseService.storage.from('avatars').list()

        if (error) {
          return handleError(error, 'Error fetching avatars:')
        }

        const avatars = data.map(async (item) => {
          const { data: fileData, error: fileError } = supabaseService.storage
            .from('avatars')
            .getPublicUrl(item.name)

          if (fileError) {
            console.error(`Error fetching URL for ${item.name}:`, fileError)
            return null
          }

          return {
            name: item.name,
            url: fileData?.publicUrl || null,
          }
        })

        const avatarData = await Promise.all(avatars)

        return res.status(200).json({ data: avatarData })
      } catch (error) {
        return handleError(error, 'Server error:')
      }

    case 'POST':
      try {
        const { id, avatar_url } = body

        const { error: updateError } = await supabaseService
          .from('users')
          .update({ avatar_url })
          .eq('id', id)

        if (updateError) {
          return handleError(updateError, 'Error updating user avatar:')
        }

        return res.status(200).json({ success: true })
      } catch (error) {
        return handleError(error, 'Server error:')
      }

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
