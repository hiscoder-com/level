import { useEffect, useState } from 'react'

import AutoSizeTextArea from '../UI/AutoSizeTextArea'

import { supabase } from 'utils/supabaseClient'
import { useRecoilState } from 'recoil'
import { checkedVersesBibleState, translatedVersesState } from '../state/atoms'

function BlindEditor({ config }) {
  const [verseObjects, setVerseObjects] = useState([])

  const [translatedVerses, setTranslatedVerses] = useRecoilState(translatedVersesState)

  const [checkedVersesBible, setCheckedVersesBible] = useRecoilState(
    checkedVersesBibleState
  )

  useEffect(() => {
    setVerseObjects(config.reference.verses)
    let updatedArray = []
    config.reference.verses.forEach((el) => {
      if (el.verse !== null) {
        updatedArray.push(el.num.toString())
      }
    })
    setTranslatedVerses(updatedArray)
    setCheckedVersesBible(updatedArray)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateVerse = (id, text) => {
    setVerseObjects((prev) => {
      prev[id].verse = text
      return [...prev]
    })
  }

  const sendToDb = async (index) => {
    setTranslatedVerses((prev) => [...prev, verseObjects[index].num.toString()])
    const res = await supabase.rpc('save_verse', {
      new_verse: verseObjects[index].verse,
      verse_id: verseObjects[index].verse_id,
    })
  }

  return (
    <div>
      {verseObjects.map((el, index) => (
        <div key={el.verse_id} data-id={el.num} className="flex my-3">
          <input
            type="checkbox"
            disabled={
              !checkedVersesBible.includes(el.num.toString()) ||
              translatedVerses.includes(el.num.toString())
            }
            className="mt-1"
            style={{
              filter: translatedVerses.includes(el.num.toString())
                ? ''
                : 'saturate(9) hue-rotate(273deg)',
            }}
            onChange={() => sendToDb(index)}
            checked={translatedVerses.includes(el.num.toString())}
          />
          <div className="ml-4">{el.num}</div>
          <AutoSizeTextArea
            disabled={
              !checkedVersesBible.includes(el.num.toString()) ||
              translatedVerses.includes(el.num.toString())
            }
            updateVerse={updateVerse}
            index={index}
            verseObject={el}
          />
        </div>
      ))}
    </div>
  )
}

export default BlindEditor
