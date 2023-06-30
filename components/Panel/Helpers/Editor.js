import { useEffect, useState } from 'react'

import { useTranslation } from 'next-i18next'

import { toast, Toaster } from 'react-hot-toast'

import AutoSizeTextArea from '../UI/AutoSizeTextArea'

import useSupabaseClient from 'utils/supabaseClient'
import { obsCheckAdditionalVerses } from 'utils/helper'

function Editor({ config }) {
  const supabase = useSupabaseClient()

  const { t } = useTranslation(['common'])

  const [verseObjects, setVerseObjects] = useState([])

  useEffect(() => {
    setVerseObjects(config.reference.verses)
  }, [config.reference.verses])

  const updateVerse = (id, text) => {
    setVerseObjects((prev) => {
      prev[id].verse = text
      const saveInDB = async () => {
        const res = await supabase.rpc('save_verses', {
          verses: { [prev[id].verse_id]: text },
        })
        if (res.error || !res) {
          toast.error(t('SaveFailed') + '. ' + t('PleaseCheckInternetConnection'), {
            duration: 8000,
          })
          console.log(res)
        }
      }
      saveInDB()
      return [...prev]
    })
  }

  return (
    <div>
      {verseObjects.map((verseObject, index) => (
        <div key={verseObject.verse_id} className="flex my-3">
          <div>{obsCheckAdditionalVerses(verseObject.num)}</div>
          <AutoSizeTextArea
            verseObject={verseObject}
            index={index}
            updateVerse={updateVerse}
          />
        </div>
      ))}
      <div className="select-none">ㅤ</div>
      <Toaster />
    </div>
  )
}

export default Editor
