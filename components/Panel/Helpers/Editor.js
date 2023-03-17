import { useEffect, useState } from 'react'

import { useTranslation } from 'next-i18next'

import AutoSizeTextArea from '../UI/AutoSizeTextArea'

import { supabase } from 'utils/supabaseClient'
import { obsCheckAdditionalVersesLocale } from 'utils/helper'

function Editor({ config }) {
  const { t } = useTranslation(['common'])

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
      {verseObjects.map((verseObject, index) => (
        <div key={verseObject.verse_id} className="flex my-3">
          <div>{obsCheckAdditionalVersesLocale(verseObject.num, t)}</div>
          <AutoSizeTextArea
            verseObject={verseObject}
            index={index}
            updateVerse={updateVerse}
          />
        </div>
      ))}
      <div className="select-none">ㅤ</div>
    </div>
  )
}

export default Editor
