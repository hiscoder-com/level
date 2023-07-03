import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import axios from 'axios'

import { useTranslation } from 'react-i18next'

import { toast, Toaster } from 'react-hot-toast'

import useSupabaseClient from 'utils/supabaseClient'

import AutoSizeTextArea from '../UI/AutoSizeTextArea'

import { useCurrentUser } from 'lib/UserContext'
import { useGetChapter, useProject } from 'utils/hooks'
import { obsCheckAdditionalVerses } from 'utils/helper'

// moderatorOnly
//              - TRUE видно все стихи, только модератор может вносить исправления
//              - FALSE видно все стихи, исправлять можно только свои

function CommandEditor({ config }) {
  const supabase = useSupabaseClient()

  const { user } = useCurrentUser()
  const { t } = useTranslation(['common'])

  const {
    query: { project, book, chapter: chapter_num },
  } = useRouter()

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
  }, [currentProject?.id, supabase, user?.id])

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
  }, [book, chapter_num, config?.reference?.verses, project, supabase])

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
        .channel('public' + 'verses:chapter_id=eq.' + chapter.id)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'verses:chapter_id=eq.' + chapter.id,
          },
          (payload) => {
            const { id, text } = payload.new
            updateVerseObject(id, text)
          }
        )
        .subscribe()
    }
    return () => {
      if (mySubscription) {
        supabase.removeChannel(mySubscription)
      }
    }
  }, [chapter?.id, supabase])

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
        .then()
        .catch((error) => {
          toast.error(t('SaveFailed') + '. ' + t('PleaseCheckInternetConnection'), {
            duration: 8000,
          })
          console.log(error)
        })
      return [...prev]
    })
  }

  return (
    <div>
      {verseObjects.map((verseObject, index) => (
        <div key={verseObject.verse_id} className="flex my-3">
          <div
            className={
              (
                config?.config?.moderatorOnly
                  ? ['user', 'translator'].includes(level)
                  : !verseObject.editable
              )
                ? 'font-bold'
                : 'text-blue-600'
            }
          >
            {obsCheckAdditionalVerses(verseObject.num)}
          </div>
          <AutoSizeTextArea
            disabled={
              config?.config?.moderatorOnly
                ? ['user', 'translator'].includes(level)
                : !verseObject.editable
            }
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

export default CommandEditor
