import { supabaseService } from 'utils/supabaseServer'
import { supabase } from 'utils/supabaseClient'

// const validation = (properties) => {
//   const error = null
//   if (!properties) {
//     return { error: 'Properties is null or undefined' }
//   }

//   try {
//     const obj = JSON.parse(JSON.stringify(properties))
//     if (!obj || typeof obj !== 'object') {
//       throw new Error('This is incorrect json')
//     }
//   } catch (error) {
//     return { error: 'This is incorrect json', properties }
//   }

//   if (
//     JSON.stringify(Object.keys(properties)?.sort()) !==
//     JSON.stringify(['obs', 'scripture'].sort())
//   ) {
//     throw new Error('Properties has different keys')
//   }

//   if (
//     JSON.stringify(Object.keys(properties.obs)?.sort()) !==
//     JSON.stringify(['title', 'intro', 'back', 'chapter_label'].sort())
//   ) {
//     throw new Error('Properties has different keys in OBS part')
//   }

//   if (
//     JSON.stringify(Object.keys(properties.scripture)?.sort()) !==
//     JSON.stringify(['h', 'toc1', 'toc2', 'toc3', 'mt', 'chapter_label'].sort())
//   ) {
//     throw new Error('Properties has different keys in Scripture part')
//   }
//   return { error }
// }

export default async function stepsHandler(req, res) {
  if (!req.headers.token) {
    return res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)

  let data = {}
  const {
    query: { code, id },
    body: { updatedPartStep },
    method,
  } = req

  // if (!project_id || !user_id) {
  //   res.status(401).json({ error: 'Access denied!' })
  // }
  // try {
  //   const level = await supabase.rpc('authorize', {
  //     user_id,
  //     project_id,
  //   })

  //   if (!['admin', 'coordinator'].includes(level.data)) {
  //     res.status(401).json({ error: 'Access denied!' })
  //   }
  // } catch (error) {
  //   res.status(404).json({ error })
  // }

  // const { error: validationError } = validation(properties)
  // if (validationError) {
  //   res.status(404).json({ validationError })
  //   return
  // }
  switch (method) {
    case 'PUT':
      try {
        const { data, error } = await supabaseService
          .from('steps')
          .update({ ...updatedPartStep })
          .match({ id })
        if (error) throw error
      } catch (error) {
        return res.status(404).json({ error })
      }
      return res.status(200).json({ success: true })

    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}