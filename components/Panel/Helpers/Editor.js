import { useEffect, useState } from 'react'

import AutoSizeTextArea from '../UI/AutoSizeTextArea'

import { supabase } from 'utils/supabaseClient'

function Editor({ config }) {
  const [verseObjects, setVerseObjects] = useState([])

  useEffect(() => {
    setVerseObjects(config.reference.verses)
  }, [config.reference.verses])

  const updateVerse = (id, text) => {
    setVerseObjects((prev) => {
      prev[id].verse = text
      // мы можем сохранять каждый стих отдельно, когда теряется фокус
      const saveInDB = async () => {
        await supabase.rpc('save_verses', { verses: { [prev[id].verse_id]: text } })
      }
      saveInDB()
      return [...prev]
    })
  }

  return (
    <div>
      {verseObjects.map((el, index) => (
        <div key={el.verse_id} className="flex my-3">
          <div>{el.num}</div>
          <AutoSizeTextArea verseObject={el} index={index} updateVerse={updateVerse} />
        </div>
      ))}
    </div>
  )
}

export default Editor
