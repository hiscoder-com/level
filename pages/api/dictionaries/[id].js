import supabaseApi from 'utils/supabaseServer'
import { supabaseService } from 'utils/supabaseService'
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
  let supabase
  try {
    supabase = await supabaseApi({ req, res })
  } catch (error) {
    return res.status(401).json({ error })
  }
  const {
    query: { id },
    body: { data: data_note, title },
    method,
  } = req

  switch (method) {
    case 'DELETE':
      try {
        const { data, error } = await supabase
          .from('dictionaries')
          .update([{ deleted_at: new Date().toISOString().toLocaleString('en-US') }])
          .match({ id })
          .select()
        if (error) throw error
        return res.status(200).json(data)
      } catch (error) {
        return res.status(404).json({ error })
      }

    case 'PUT':
      if (!validateNote(data_note)) {
        await sendLog({
          url: `api/dictionaries/${id}`,
          type: 'update dictionary',
          error: 'wrong type of the note',
          note: data_note,
        })
        throw { error: 'wrong type of the note' }
      }
      try {
        const { data, error } = await supabase
          .from('dictionaries')
          .update([{ data: data_note, title }])
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
