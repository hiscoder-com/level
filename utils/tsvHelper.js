export function filterNotes(newNote, verse, notes) {
  if (!notes[verse]) {
    notes[verse] = [newNote]
  } else {
    notes[verse].push(newNote)
  }
}
