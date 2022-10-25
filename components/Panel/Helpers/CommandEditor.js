import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import axios from 'axios'

import AutoSizeTextArea from '../UI/AutoSizeTextArea'

import { supabase } from 'utils/supabaseClient'
import { useCurrentUser } from 'lib/UserContext'

// TODO попробовать его расширить и поставить проверки
// Если приходит параметр разрешить изменять свои стихи - то тогда в disabled изменить условие, делать неактивными чужие стихи
// опять же повторю что это первая версия, очень дырявая получается, надо рефакторить, ставить проверки и т.д.

function CommandEditor({ config }) {
  const { user } = useCurrentUser()
  const [level, setLevel] = useState('user')
  const {
    query: { project, chapter },
  } = useRouter()
  const [verseObjects, setVerseObjects] = useState([])

  useEffect(() => {
    const getLevel = async (user_id, project_id) => {
      const level = await supabase.rpc('authorize', {
        user_id,
        project_id,
      })
      setLevel(level.data)
    }
    if (user.id) {
      supabase
        .from('verses')
        .select(
          'verse_id:id,verse:text,num,project_id,chapters!inner(num),projects!inner(code)'
        )
        .match({ 'projects.code': project, 'chapters.num': chapter })
        .order('num', 'ascending')
        .then((res) => {
          console.log(res)
          setVerseObjects(res.data)
          getLevel(user.id, res.data[0].project_id)
        })
    }
  }, [chapter, project, user.id])

  const updateVerse = (id, text) => {
    setVerseObjects((prev) => {
      prev[id].verse = text
      axios.defaults.headers.common['token'] = user?.access_token
      axios
        .post(`/api/save_verse`, { id: prev[id].verse_id, text })
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
          <div>{el.num}</div>
          <AutoSizeTextArea
            disabled={['user', 'translator'].includes(level)}
            verseObject={el}
            index={index}
            updateVerse={updateVerse}
          />
        </div>
      ))}
    </div>
  )
}

export default CommandEditor
