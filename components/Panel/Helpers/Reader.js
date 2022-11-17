import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import AutoSizeTextArea from '../UI/AutoSizeTextArea'

import { supabase } from 'utils/supabaseClient'

function Reader({ config }) {
  const {
    query: { project, book, chapter },
  } = useRouter()

  const [chapterId, setChapterId] = useState(false)
  const [verseObjects, setVerseObjects] = useState([])

  useEffect(() => {
    supabase
      .from('chapters')
      .select('id,projects!inner(code),books!inner(code)')
      .match({ num: chapter, 'projects.code': project, 'books.code': book })
      .maybeSingle()
      .then((res) => {
        if (res.data.id) {
          setChapterId(res.data.id)
        }
      })
  }, [book, chapter, project])

  useEffect(() => {
    supabase
      .rpc('get_whole_chapter', {
        project_code: project,
        chapter_num: chapter,
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
  }, [book, chapter, config?.reference?.verses, config?.wholeChapter, project])

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
    if (chapterId) {
      mySubscription = supabase
        .from('verses:chapter_id=eq.' + chapterId)
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
  }, [chapterId])

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
