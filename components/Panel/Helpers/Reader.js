import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import AutoSizeTextArea from '../UI/AutoSizeTextArea'

import { supabase } from 'utils/supabaseClient'
import { useGetChapter } from 'utils/hooks'
import { useCurrentUser } from 'lib/UserContext'

function Reader({ config }) {
  const {
    query: { project, book, chapter: chapter_num },
  } = useRouter()
  const { user } = useCurrentUser()
  const [verseObjects, setVerseObjects] = useState([])
  const [chapter] = useGetChapter({
    token: user?.access_token,
    code: project,
    book_code: book,
    chapter_id: chapter_num,
  })

  useEffect(() => {
    supabase
      .rpc('get_whole_chapter', {
        project_code: project,
        chapter_num,
        book_code: book,
      })
      .then((res) => {
        const verses = config?.reference?.verses?.map((v) => v.verse_id.toString())
        const result = res.data
          .map((el) => ({
            verse_id: el.verse_id,
            verse: el.verse,
            num: el.num,
            editable: verses.includes(el.verse_id),
          }))
          .filter((el) => config?.wholeChapter || verses.includes(el.verse_id.toString()))
        setVerseObjects(result)
      })
  }, [book, chapter_num, config?.reference?.verses, config?.wholeChapter, project])

  const updateVerseObject = (id, text) => {
    setVerseObjects((prev) => {
      const newVerseObject = prev.map((el) => {
        if (el.verse_id === id) {
          el.verse = text
        }
        return el
      })
      return newVerseObject
    })
  }

  useEffect(() => {
    let mySubscription = null
    if (chapter?.id) {
      mySubscription = supabase
        .from('verses:chapter_id=eq.' + chapter.id)
        .on('UPDATE', (payload) => {
          const { id, text } = payload.new
          updateVerseObject(id, text)
        })
        .subscribe()
    }
    return () => {
      if (mySubscription) {
        supabase.removeSubscription(mySubscription)
      }
    }
  }, [chapter?.id])

  return (
    <div>
      {verseObjects.map((el, index) => (
        <div key={el.verse_id} className="flex my-3">
          <div>{el.num}</div>
          <AutoSizeTextArea
            disabled={true}
            verseObject={el}
            index={index}
            updateVerse={() => {}}
          />
        </div>
      ))}
    </div>
  )
}

export default Reader
