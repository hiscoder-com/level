import { supabaseService } from 'utils/supabaseService'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
  const svgRegex = /<svg[\s\S]*<\/svg>/
  const matches = req.body.match(svgRegex)

  if (!matches) {
    return res.status(400).json({ error: 'Invalid SVG content' })
  }
  const svgContent = matches[0]
  const timestamp = Date.now()
  const { userId } = parseMultipartData(req.body)
  const fileName = `user_${userId}_${timestamp}.svg`

  try {
    const { data: existingAvatars, error: fetchError } = await supabaseService.storage
      .from('avatars')
      .list('', { limit: 100, search: `user_${userId}` })

    if (fetchError) {
      console.error('Error fetching existing file:', fetchError)
      return res.status(500).json({ error: 'Error fetching existing avatar' })
    }

    const { error: uploadError } = await supabaseService.storage
      .from('avatars')
      .upload(fileName, svgContent, {
        cacheControl: 'no-cache',
        contentType: 'image/svg+xml',
      })

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      return res.status(500).json({ error: 'Internal Server Error' })
    }

    if (existingAvatars.length > 0) {
      const oldAvatarNames = existingAvatars.map((file) => file.name)
      const { error: deleteError } = await supabaseService.storage
        .from('avatars')
        .remove(oldAvatarNames)

      if (deleteError) {
        console.error('Error deleting existing avatar:', deleteError)
        return res.status(500).json({ error: 'Error deleting existing avatar' })
      }
    }

    return res.status(200).json({
      url: `${process.env.SUPABASE_URL}/storage/v1/object/public/avatars/${fileName}`,
    })
  } catch (error) {
    console.error('Error handling file upload:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

function parseMultipartData(body) {
  const boundaryPattern = /----WebKitFormBoundary[\w\d]+/
  const boundary = body.match(boundaryPattern)[0]

  const parts = body.split(boundary)
  let userId

  parts.forEach((part) => {
    if (part.includes('name="userId"')) {
      const userIdPart = part.split('\r\n\r\n')[1]
      userId = userIdPart.substring(0, userIdPart.lastIndexOf('\r\n')).trim()
    }
  })

  return { userId }
}
