import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import dynamic from 'next/dynamic'

import axios from 'axios'

import { useTranslation } from 'next-i18next'

import { useCurrentUser } from 'lib/UserContext'
import { useTeamNotes, useProject } from 'utils/hooks'
import { supabase } from 'utils/supabaseClient'

import Close from 'public/close.svg'
import Waste from 'public/waste.svg'
import Modal from 'components/Modal'

const Redactor = dynamic(
  () => import('@texttree/notepad-rcl').then((mod) => mod.Redactor),
  {
    ssr: false,
  }
)

const ListOfNotes = dynamic(
  () => import('@texttree/notepad-rcl').then((mod) => mod.ListOfNotes),
  {
    ssr: false,
  }
)

function TeamNotes() {
  const [noteId, setNoteId] = useState('test_noteId')
  const [editable, setEditable] = useState(false)
  const [activeNote, setActiveNote] = useState(null)
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [noteToDel, setNoteToDel] = useState(null)
  const { t } = useTranslation(['common'])
  const { user } = useCurrentUser()
  const router = useRouter()
  const {
    query: { project: code },
  } = router
  const [project] = useProject({ token: user?.access_token, code })
  const [notes, { loading, error, mutate }] = useTeamNotes({
    token: user?.access_token,
    project_id: project?.id,
  })
  useEffect(() => {
    const getLevel = async () => {
      const level = await supabase.rpc('authorize', {
        user_id: user.id,
        project_id: project.id,
      })
      setEditable(['admin', 'coordinator', 'moderator'].includes(level.data))
    }
    if ((user?.id, project?.id)) {
      getLevel()
    }
  }, [user?.id, project?.id])

  useEffect(() => {
    const currentNote = notes?.find((el) => el.id === noteId)
    setActiveNote(currentNote)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId])

  const addNote = () => {
    const id = ('000000000' + Math.random().toString(36).substring(2, 9)).slice(-9)
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .post('/api/team_notes', { id, project_id: project?.id })
      .then(() => mutate())
      .catch((err) => console.log(err))
  }

  const removeNote = (id) => {
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .delete(`/api/team_notes/${id}`)
      .then(() => mutate())
      .catch((err) => console.log(err))
  }
  useEffect(() => {
    if (!activeNote || !editable) {
      return
    }
    const timer = setTimeout(() => {
      axios.defaults.headers.common['token'] = user?.access_token
      axios
        .put(`/api/team_notes/${activeNote?.id}`, activeNote)
        .then(() => mutate())
        .catch((err) => console.log(err))
    }, 2000)
    return () => {
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNote, editable])

  return (
    <div className="relative">
      {!activeNote ? (
        <div>
          {editable && (
            <div className="flex justify-end">
              <button
                className="btn-cyan text-xl font-bold mb-4 right-0"
                onClick={addNote}
              >
                +
              </button>
            </div>
          )}
          <ListOfNotes
            notes={notes}
            removeNote={(e) => {
              setIsOpenModal(true)
              setNoteToDel(notes?.find((el) => el.id === e))
            }}
            setNoteId={setNoteId}
            classes={{
              item: 'bg-cyan-50 my-3 rounded-lg cursor-pointer shadow-md flex justify-between items-start group',
              title: 'font-bold p-2 mr-4',
              text: 'px-2 h-10 overflow-hidden',
              delBtn: 'p-2 m-1 top-0 opacity-0 group-hover:opacity-100',
            }}
            isShowDelBtn={editable}
            delBtnChildren={<Waste className={'w-4 h-4 fill-gray-500'} />}
          />
        </div>
      ) : (
        <>
          <div
            className="absolute top-0 right-0 w-8 pt-3 pr-3 cursor-pointer"
            onClick={() => {
              setActiveNote(null)
              setNoteId(null)
            }}
          >
            <Close />
          </div>
          <Redactor
            classes={{
              wrapper: '',
              title: 'bg-cyan-50 p-2 font-bold rounded-lg my-4 shadow-md mr-12',
              redactor:
                'bg-cyan-50 pb-20 overflow-hidden break-words p-4 px-4 rounded-lg my-4 shadow-md',
            }}
            activeNote={activeNote}
            setActiveNote={setActiveNote}
            readOnly={!editable}
            placeholder={editable ? t('Text_new_note') : ''}
          />
        </>
      )}
      <Modal
        isOpen={isOpenModal}
        closeHandle={() => {
          setIsOpenModal(false)
        }}
      >
        {' '}
        <div className="text-center">
          <div className="mb-4">
            {t('Are_you_sure_delete') + ' ' + t(noteToDel?.title) + '?'}
          </div>
          <button
            className="btn-cyan mx-2"
            onClick={() => {
              setIsOpenModal(false)
              if (noteToDel) {
                removeNote(noteToDel.id)
                setNoteToDel(null)
              }
            }}
          >
            {t('Yes')}
          </button>
          <button
            className="btn-cyan mx-2"
            onClick={() => {
              setNoteToDel(null)
              setIsOpenModal(false)
            }}
          >
            {t('No')}
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default TeamNotes
