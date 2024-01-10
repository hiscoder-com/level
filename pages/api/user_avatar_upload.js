import { supabaseService } from 'utils/supabaseService'

export default async function handler(req, res) {
  let test
  const svgRegex = /<svg[\s\S]*<\/svg>/
  const matches = req.body.match(svgRegex)

  if (matches) {
    const svgContent = matches[0]
    test = svgContent
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const { data, error } = await supabaseService.storage
      .from('avatars')
      .upload('avatar_25.svg', test, {
        cacheControl: 'no-cache',
        upsert: false,
        contentType: 'image/svg+xml',
      })

    if (error) {
      console.error('Error uploading file:', error)
      return res.status(500).json({ error: 'Internal Server Error' })
    }

    return res.status(200).json({ url: data.publicURL })
  } catch (error) {
    console.error('Error handling file upload:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
