import { useEffect, useState } from 'react'

import { useTranslation } from 'next-i18next'

import { toast } from 'react-hot-toast'

import AutoSizeTextArea from '../UI/AutoSizeTextArea'

import useSupabaseClient from 'utils/supabaseClient'
import { obsCheckAdditionalVerses } from 'utils/helper'
import { useScroll } from 'utils/hooks'

function Editor({ config }) {
  const supabase = useSupabaseClient()
  const { t } = useTranslation(['common'])
  const [verseObjects, setVerseObjects] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  useScroll({
    toolName: 'translate',
    idPrefix: 'translate',
    isLoading,
  })
  useEffect(() => {
    setIsLoading(true)
    setVerseObjects(config.reference.verses?.filter((verse) => verse.num < 201))
    setIsLoading(false)
  }, [config.reference.verses])

  const updateVerse = (id, text) => {
    setVerseObjects((prev) => {
      prev[id].verse = text
      const saveInDB = async () => {
        const res = await supabase.rpc('save_verses', {
          verses: { [prev[id].verse_id]: text },
        })
        if (res.error || !res) {
          toast.error(t('SaveFailed') + '. ' + t('CheckInternet'), {
            duration: 8000,
          })
        }
      }
      saveInDB()
      return [...prev]
    })
  }

  return (
    <>
      {verseObjects.map((verseObject, index) => (
        <div
          key={verseObject.verse_id}
          id={'translate' + verseObject.num}
          className="flex my-3 pt-1"
          dir={config?.isRtl ? 'rtl' : 'ltr'}
        >
          <div>{obsCheckAdditionalVerses(verseObject.num)}</div>
          <AutoSizeTextArea
            verseObject={verseObject}
            index={index}
            updateVerse={updateVerse}
          />
        </div>
      ))}
      <div className="select-none">ㅤ</div>
    </>
  )
}

export default Editor
