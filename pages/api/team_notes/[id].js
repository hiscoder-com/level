import supabaseApi from 'utils/supabaseServer'
import { supabaseService } from 'utils/supabaseService'
import { validateNote, validateTitle } from 'utils/helper'

const sendLog = async (log) => {
  const { data, error } = await supabaseService
    .from('logs')
    .insert({
      log,
    })
    .select()
  return { data, error }
}

export default async function notesDeleteHandler(req, res) {
  let supabase
  try {
    supabase = await supabaseApi({ req, res })
  } catch (error) {
    return res.status(401).json({ error })
  }
  const {
    query: { id },
    body: { data: data_note, title, parent_id },
    method,
  } = req

  switch (method) {
    case 'GET':
      try {
        const { data, error } = await supabase
          .from('team_notes')
          .select('*')
          .eq('project_id', id)
          .is('deleted_at', null)
          .order('changed_at', { ascending: false })

        if (error) throw error
        return res.status(200).json(data)
      } catch (error) {
        return res.status(404).json({ error })
      }
    case 'DELETE':
      try {
        const deleteRecursive = async (parentId) => {
          const { data: children, error: childrenError } = await supabase
            .from('team_notes')
            .select('id')
            .eq('parent_id', parentId)

          if (childrenError) throw childrenError

          if (children && children.length > 0) {
            for (const child of children) {
              await deleteRecursive(child.id)
            }
          }

          const { error: deleteError } = await supabase
            .from('team_notes')
            .update({
              deleted_at: new Date().toISOString().toLocaleString('en-US'),
              parent_id: null,
              sorting: null,
            })
            .eq('parent_id', parentId)

          if (deleteError) throw deleteError
        }

        await deleteRecursive(id)

        const { error: deleteFolderError } = await supabase
          .from('team_notes')
          .update({
            deleted_at: new Date().toISOString().toLocaleString('en-US'),
            parent_id: null,
            sorting: null,
          })
          .eq('id', id)

        if (deleteFolderError) throw deleteFolderError

        return res.status(200).json({ message: 'Successfully deleted' })
      } catch (error) {
        return res.status(404).json({ error })
      }
    case 'PUT':
      try {
        let updateData = {}
        if (data_note) {
          if (!validateNote(data_note)) {
            await sendLog({
              url: `api/team_notes/${id}`,
              type: 'update team note',
              error: 'wrong type of the note',
              note: data_note,
            })
            throw { error: 'wrong type of the note' }
          }

          updateData = { data: data_note, title, parent_id }
        } else if (title) {
          if (!validateTitle(title)) {
            await sendLog({
              url: `api/team_notes/${id}`,
              type: 'update team note',
              error: 'wrong type of the title',
              title,
            })
            throw { error: 'wrong type of the title' }
          }

          updateData = { title }
        }

        const { data, error } = await supabase
          .from('team_notes')
          .update([updateData])
          .match({ id })
          .select()
        if (error) throw error

        return res.status(200).json(data)
      } catch (error) {
        return res.status(404).json({ error })
      }
    default:
      res.setHeader('Allow', ['GET', 'DELETE', 'PUT'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
