import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import { supabaseService } from 'utils/supabaseServer'
import { validateNote } from 'utils/helper'

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
  if (!req?.headers?.token) {
    return res.status(401).json({ error: 'Access denied!' })
  }
  const supabase = createPagesServerClient({ req, res })
  const {
    query: { id },
    body: { data: data_note, title, parent_id },
    method,
  } = req

  switch (method) {
    case 'DELETE':
      try {
        const { data, error } = await supabase
          .from('personal_notes')
          .update([{ deleted_at: new Date().toISOString().toLocaleString('en-US') }])
          .match({ id })
          .select()
        if (error) throw error
        return res.status(200).json(data)
      } catch (error) {
        return res.status(404).json({ error })
      }

    case 'PUT':
      try {
        if (!validateNote(data_note)) {
          await sendLog({
            url: `api/personal_notes/${id}`,
            type: 'update personal note',
            error: 'wrong type of the note',
            note: data_note,
          })
          throw { error: 'wrong type of the note' }
        }

        const { data, error } = await supabase
          .from('personal_notes')
          // TODO заметку же папкой не сделать, по этому isFolder не надо передавать
          .update([{ data: data_note, title, parent_id }])
          .match({ id })
          .select()
        if (error) throw error
        return res.status(200).json(data)
      } catch (error) {
        return res.status(404).json({ error })
      }

    default:
      res.setHeader('Allow', ['DELETE', 'PUT'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
