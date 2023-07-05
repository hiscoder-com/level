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

export default async function bookPropertiesHandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  let data = {}

  const {
    query: { id, code },
    body,
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
    case 'GET':
      try {
        const { data: value, error } = await supabase
          .from('steps')
          .select(
            'id, projects!inner(code), description, intro, title, count_of_users, time, config'
          )
          .eq('projects.code', code)
          .order('sorting', { ascending: true })
        if (error) throw error
        data = value
      } catch (error) {
        console.log({ error })
        res.status(404).json({ error })
        return
      }
      res.status(200).json(data)
      break
    case 'PUT':
      const project_id = body
      try {
        // return
        const { data, error } = await supabaseService.from('steps').upsert(body._steps)
        // .match({ project_id })
        if (error) throw error
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      res.status(200).json({ success: true })

      break

    default:
      res.setHeader('Allow', ['GET', 'PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
