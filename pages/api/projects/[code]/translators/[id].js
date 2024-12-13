import supabaseApi from 'utils/supabaseServer'

export default async function languageProjectTranslatorHandler(req, res) {
  let supabase
  try {
    supabase = await supabaseApi({ req, res })
  } catch (error) {
    return res.status(401).json({ error })
  }
  const {
    query: { code, id },
    method,
  } = req
  let project_id = null

  switch (method) {
    case 'DELETE':
      try {
        const { data: project, error } = await supabase
          .from('projects')
          .select('id')
          .eq('code', code)
          .single()
        if (error) throw error
        if (!project?.id) throw { error: 'Missing id of project' }

        const { data: translator, error: translatorError } = await supabase
          .from('project_translators')
          .select('id')
          .match({ project_id: project.id, user_id: id })
          .single()
        if (translatorError) throw translatorError

        const { data: hasVerses, error: checkError } = await supabase.rpc(
          'has_assigned_verses',
          { project_translator_id: translator.id }
        )
        if (checkError) throw checkError
        if (hasVerses) {
          return res.status(400).json({
            error: 'Cannot remove translator with assigned verses',
          })
        }

        const { data, error: deleteError } = await supabase
          .from('project_translators')
          .delete()
          .match({ id: translator.id })
          .select()
        if (deleteError) throw deleteError

        return res.status(200).json(data)
      } catch (error) {
        return res.status(404).json({ error })
      }

    default:
      res.setHeader('Allow', ['DELETE'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
