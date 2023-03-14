import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import axios from 'axios'
import { useTranslation } from 'next-i18next'

import { supabase } from 'utils/supabaseClient'

import AutoSizeTextArea from '../UI/AutoSizeTextArea'

import { useCurrentUser } from 'lib/UserContext'
import { useGetChapter, useProject } from 'utils/hooks'

// moderatorOnly
//              - TRUE видно все стихи, только модератор может вносить исправления
//              - FALSE видно все стихи, исправлять можно только свои

function CommandEditor({ config }) {
  const { user } = useCurrentUser()

  const {
    query: { project, book, chapter: chapter_num },
  } = useRouter()
  const { t } = useTranslation(['common'])

  const [level, setLevel] = useState('user')
  const [verseObjects, setVerseObjects] = useState([])

  const [currentProject] = useProject({ token: user?.access_token, code: project })
  const [chapter] = useGetChapter({
    token: user?.access_token,
    code: project,
    book_code: book,
    chapter_id: chapter_num,
  })
  useEffect(() => {
    const getLevel = async (user_id, project_id) => {
      const level = await supabase.rpc('authorize', {
        user_id,
        project_id,
      })
      setLevel(level.data)
    }
    if (currentProject?.id && user?.id) {
      getLevel(user.id, currentProject.id)
    }
  }, [currentProject?.id, user?.id])

  useEffect(() => {
    supabase
      .rpc('get_whole_chapter', {
        project_code: project,
        chapter_num,
        book_code: book,
      })
      .then((res) => {
        const verses = config?.reference?.verses?.map((v) => v.verse_id)
        const result = res.data.map((el) => ({
          verse_id: el.verse_id,
          verse: el.verse,
          num: el.num,
          editable: verses.includes(el.verse_id),
        }))
        setVerseObjects(result)
      })
  }, [book, chapter_num, config?.reference?.verses, project])

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

  const updateVerse = (id, text) => {
    setVerseObjects((prev) => {
      if (
        !(config?.config?.moderatorOnly
          ? !['user', 'translator'].includes(level)
          : prev[id].editable)
      ) {
        return prev
      }
      prev[id].verse = text
      axios.defaults.headers.common['token'] = user?.access_token
      axios
        .put(`/api/save_verse`, { id: prev[id].verse_id, text })
        .then((res) => {
          console.log('save_verse', res)
        })
        .catch((error) => console.log(error))
      return [...prev]
    })
  }

  return (
    <div>
      {verseObjects.map((el, index) => (
        <div key={el.verse_id} className="flex my-3">
          <div
            className={
              (
                config?.config?.moderatorOnly
                  ? ['user', 'translator'].includes(level)
                  : !el.editable
              )
                ? 'text-blue-600'
                : 'font-bold'
            }
          >
            {el.num === 0 ? t('Title') : el.num === 200 ? t('Reference') : el.num}
          </div>
          <AutoSizeTextArea
            disabled={
              config?.config?.moderatorOnly
                ? ['user', 'translator'].includes(level)
                : !el.editable
            }
            verseObject={el}
            index={index}
            updateVerse={updateVerse}
          />
        </div>
      ))}
      <div className="select-none">ㅤ</div>
    </div>
  )
}

export default CommandEditor
