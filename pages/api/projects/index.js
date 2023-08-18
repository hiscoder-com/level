import supabaseApi from 'utils/supabaseServer'
import { parseManifests, validationBrief } from 'utils/helper'

export default async function languageProjectsHandler(req, res) {
  let supabase
  try {
    supabase = await supabaseApi({ req, res })
  } catch (error) {
    return res.status(401).json({ error })
  }
  const {
    body: {
      language_id,
      method_id,
      code,
      title,
      origtitle,
      resources,
      steps,
      customBriefQuestions,
      isBriefEnable,
    },
    method,
  } = req

  switch (method) {
    case 'POST':
      try {
        if (!Object?.keys(resources)?.length) {
          throw new Error('There is no information about resources')
        }

        if (
          Object?.values(resources).filter((el) => el).length !==
          Object?.keys(resources)?.length
        ) {
          throw new Error('Not all resource fields are filled in')
        }

        if (validationBrief(customBriefQuestions)?.error) {
          throw new Error('Brief template is not valid')
        }

        const { data: current_method, error: methodError } = await supabase
          .from('methods')
          .select('*')
          .eq('id', method_id)
          .single()

        if (methodError) throw methodError

        if (
          JSON.stringify(Object.keys(resources).sort()) !==
          JSON.stringify(Object.keys(current_method.resources).sort())
        ) {
          throw new Error('Resources not an equal')
        }

        const {
          data: { baseResource, newResources },
          error: errorManifest,
        } = await parseManifests({
          resources,
          current_method,
        })

        if (errorManifest) throw errorManifest

        const { data: project, error } = await supabase
          .from('projects')
          .insert([
            {
              title,
              orig_title: origtitle,
              code,
              language_id,
              type: current_method.type,
              resources: newResources,
              method: current_method.title,
              base_manifest: {
                resource: baseResource.name,
                books: baseResource.books,
              },
            },
          ])
          .single()
          .select()

        if (error) throw error

        const { error: briefError } = await supabase.rpc('create_brief', {
          project_id: project.id,
          is_enable: isBriefEnable,
          data_collection: customBriefQuestions,
        })
        if (briefError) {
          await supabaseService.from('projects').delete().eq('id', project.id)
          throw briefError
        }
        let sorting = 1
        for (const step_el of steps) {
          await supabase
            .from('steps')
            .insert([{ ...step_el, sorting: sorting++, project_id: project.id }])
        }
        res.setHeader('Location', `/projects/${project[0].code}`)
        return res.status(201).json({})
      } catch (error) {
        return res.status(404).json({ error })
      }
    case 'GET':
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id,title,code,type,method,languages!inner(*)')
          .order('title', { ascending: true })
        if (error) throw error
        return res.status(200).json(data)
      } catch (error) {
        return res.status(404).json({ error })
      }
    default:
      res.setHeader('Allow', ['POST', 'GET'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
