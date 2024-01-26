import { IncomingForm } from 'formidable'
import { decode } from 'base64-arraybuffer'

import { supabaseService } from 'utils/supabaseService'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function uploadFileHandler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const data = await new Promise((resolve, reject) => {
      const form = new IncomingForm()

      form.parse(req, (err, fields, files) => {
        if (err) return reject(err)
        resolve({ fields, files })
      })
    })

    const userId = data.fields.userId
    const fileName = `user_${userId}_${Date.now()}.png`
    const base64Image = data.fields.file[0]
    const arrayBuffer = decode(base64Image.split(',')[1])

    const { data: existingFiles, error: listError } = await supabaseService.storage
      .from('avatars')
      .list('', { limit: 1, search: `user_${userId}_` })

    if (listError) {
      console.error('Error fetching existing files:', listError)
      return res.status(500).json({ error: 'Error fetching existing files' })
    }

    const { error: uploadError } = await supabaseService.storage
      .from('avatars')
      .upload(fileName, arrayBuffer, {
        cacheControl: 'no-cache',
        contentType: 'image/png',
      })

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      return res.status(500).json({ error: 'Internal Server Error' })
    }

    if (existingFiles.length > 0) {
      const oldFileNames = existingFiles.map((file) => file.name)
      const { error: deleteError } = await supabaseService.storage
        .from('avatars')
        .remove(oldFileNames)

      if (deleteError) {
        console.error('Error deleting old file:', deleteError)
      }
    }

    const { data: publicURL, error: urlError } = supabaseService.storage
      .from('avatars')
      .getPublicUrl(fileName)

    if (urlError) {
      console.error('Error getting public URL:', urlError)
      return res.status(500).json({ error: 'Error getting public URL' })
    }
    res.status(200).json({
      message: 'File uploaded successfully',
      fileName,
      url: publicURL.publicUrl,
    })
  } catch (error) {
    console.error('Error handling file upload:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
