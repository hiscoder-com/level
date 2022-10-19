import { useEffect, useState } from 'react'
import { supabase } from 'utils/supabaseClient'

import AutoSizeTextArea from '../UI/AutoSizeTextArea'

function Editor({ config }) {
  const [verseObjects, setVerseObjects] = useState([])

  useEffect(() => {
    setVerseObjects(config.reference.verses)
  }, [config.reference.verses])

  const handleClean = () => {
    setVerseObjects((prev) => {
      prev.forEach((el) => {
        if (el.verse) {
          el.verse = el.verse
            .replace(/  +/g, ' ')
            .replace(/ +([\.\,\)\!\?\;\:])/g, '$1')
            .trim()
        }
      })
      return [...prev]
    })
  }

  const updateVerse = (id, text) => {
    setVerseObjects((prev) => {
      prev[id].verse = text
      return [...prev]
    })
  }

  const handleSave = async () => {
    console.log(verseObjects)
    // await supabase.from('verses').update()
  }

  return (
    <div>
      {verseObjects.map((el, index) => (
        <div key={el.verse_id} className="flex my-3">
          <div>{el.num}</div>
          <AutoSizeTextArea verseObject={el} index={index} updateVerse={updateVerse} />
        </div>
      ))}
      <button onClick={handleSave} className={'btn-cyan'}>
        Save to DB
      </button>
    </div>
  )
}

export default Editor
