import { supabaseService } from 'utils/supabaseService'

export default async function handler(req, res) {
  const { method, body, query } = req

  const handleError = (error, errorMessage) => {
    console.error(errorMessage, error)
    res.status(500).json({ error: 'Internal Server Error' })
  }

  switch (method) {
    case 'GET':
      const userId = query.id

      try {
        const { data: allAvatars, error: allAvatarsError } = await supabaseService.storage
          .from('avatars')
          .list()

        if (allAvatarsError) {
          return handleError(allAvatarsError, 'Error fetching avatars:')
        }

        const avatars = allAvatars.map(async (avatar) => {
          const { data: fileData, error: fileError } = supabaseService.storage
            .from('avatars')
            .getPublicUrl(avatar.name)

          if (fileError) {
            console.error(`Error fetching URL for ${avatar.name}:`, fileError)
            return null
          }

          return {
            name: avatar.name,
            url: fileData?.publicUrl || null,
          }
        })

        const avatarData = await Promise.all(avatars)

        const filteredData = avatarData.filter((avatar) => {
          return avatar.name.includes('avatar') || avatar.name.includes(`_${userId}_`)
        })

        filteredData.sort(
          (a, b) => b.name.includes(`_${userId}_`) - a.name.includes(`_${userId}_`)
        )

        return res.status(200).json({ data: filteredData })
      } catch (error) {
        return handleError(error, 'Server error:')
      }

    case 'POST':
      try {
        const { id, avatar_url } = body

        const { data, error: fetchError } = await supabaseService
          .from('users')
          .select('avatar_url')
          .eq('id', id)
          .single()

        if (fetchError) {
          return handleError(fetchError, 'Error fetching current user avatar:')
        }
        const prev_url = data.avatar_url

        if (avatar_url === null && prev_url && prev_url.includes(id)) {
          const oldFileName = prev_url.split('/').pop()

          const { error: deleteError } = await supabaseService.storage
            .from('avatars')
            .remove([oldFileName])

          if (deleteError) {
            console.error('Error deleting old file:', deleteError)
          }
        }

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
