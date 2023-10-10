import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import { useTranslation } from 'next-i18next'
import { toast, Toaster } from 'react-hot-toast'
import useSupabaseClient from 'utils/supabaseClient'
import AutoSizeTextArea from '../UI/AutoSizeTextArea'
import { useCurrentUser } from 'lib/UserContext'
import { useGetChapter, useProject } from 'utils/hooks'
import { obsCheckAdditionalVerses } from 'utils/helper'

function CommandEditor({ config }) {
  const supabase = useSupabaseClient()
  const { user } = useCurrentUser()
  const { t } = useTranslation(['common'])
  const {
    query: { project, book, chapter: chapter_num },
  } = useRouter()
  const [level, setLevel] = useState('user')
  const [verseObjects, setVerseObjects] = useState([])
  const [currentProject] = useProject({ code: project })
  const [chapter] = useGetChapter({
    code: project,
    book_code: book,
    chapter_id: chapter_num,
  })

  useEffect(() => {
    const getLevel = async (user_id, project_id) => {
      const { data: levelData } = await supabase.rpc('authorize', {
        user_id,
        project_id,
      })
      setLevel(levelData)
    }
    if (currentProject?.id && user?.id) {
      getLevel(user.id, currentProject.id)
    }
  }, [currentProject?.id, supabase, user?.id])

  const copyVersesFromResource = useCallback(
    async (versesFromDb, versesFromResource) => {
      const verseMappings = versesFromResource?.verseObjects?.reduce((acc, el) => {
        acc[el.verse] = el.text
        return acc
      }, {})
      const versesToSave = versesFromDb.reduce((acc, verse) => {
        acc[verse.verse_id] = verseMappings[verse.num]
        return acc
      }, {})
      const { error: errorPost } = await supabase.rpc('save_verses_if_null', {
        verses: versesToSave,
      })
      if (errorPost) {
        toast.error(t('SaveFailed') + '. ' + t('CheckInternet'), {
          duration: 8000,
        })
        console.log(errorPost)
      }
    },
    [supabase, t]
  )
  useEffect(() => {
    const fetchVerseData = async () => {
      try {
        const res = await supabase.rpc('get_whole_chapter', {
          project_code: project,
          chapter_num,
          book_code: book,
        })
        const verses = config?.reference?.verses?.map((v) => v.verse_id)
        const result = res.data.map((el) => ({
          verse_id: el.verse_id,
          verse: el.verse,
          num: el.num,
          editable: verses.includes(el.verse_id),
        }))
        const versesFromDb = result.filter((verse) => verse.num < 201)
        setVerseObjects(versesFromDb)
        if (config.config.getFromResource && config.mainResource) {
          const { owner, repo, commit, bookPath } = config.mainResource
          const params = {
            verses: [],
            book,
            chapter: chapter_num,
            owner,
            repo,
            commit,
            bookPath,
          }
          const versesFromResource = await axios.get('/api/git/bible', { params })
          copyVersesFromResource(versesFromDb, versesFromResource.data)
        }
      } catch (error) {
        console.log(error)
      }
    }
    fetchVerseData()
  }, [
    book,
    chapter_num,
    config.config.getFromResource,
    config.mainResource,
    config?.reference?.verses,
    copyVersesFromResource,
    project,
    supabase,
  ])

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
        .channel('public:verses' + chapter.id)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'verses',
            filter: 'chapter_id=eq.' + chapter.id,
          },
          (payload) => {
            const { id, text } = payload.new
            updateVerseObject(id, text)
          }
        )
        .subscribe()
      return () => {
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
      axios
        .put(`/api/save_verse`, { id: prev[id].verse_id, text })
        .then()
        .catch((error) => {
          toast.error(t('SaveFailed') + '. ' + t('CheckInternet'), {
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
