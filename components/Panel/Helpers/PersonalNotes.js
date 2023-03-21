import { useEffect, useState } from 'react'

import dynamic from 'next/dynamic'

import { useTranslation } from 'next-i18next'

import axios from 'axios'
import { toast, Toaster } from 'react-hot-toast'

import { useCurrentUser } from 'lib/UserContext'

import Modal from 'components/Modal'

import { usePersonalNotes } from 'utils/hooks'
import { removeCacheNote, saveCacheNote } from 'utils/helper'

import Close from 'public/close.svg'
import Trash from 'public/trash.svg'

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

function PersonalNotes() {
  const [noteId, setNoteId] = useState('')
  const [activeNote, setActiveNote] = useState(null)
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [noteToDel, setNoteToDel] = useState(null)
  const { t } = useTranslation(['common'])
  const { user } = useCurrentUser()
  const [notes, { mutate }] = usePersonalNotes({
    token: user?.access_token,
    sort: 'changed_at',
  })

  const removeCacheAllNotes = (key) => {
    localStorage.removeItem(key)
  }

  const saveNote = () => {
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .put(`/api/personal_notes/${noteId}`, activeNote)
      .then(() => {
        saveCacheNote('personal-notes', activeNote, user)
        mutate()
      })
      .catch((err) => {
        toast.error(t('SaveFailed'))
        console.log(err)
      })
  }
  useEffect(() => {
    const currentNote = notes?.find((el) => el.id === noteId)
    setActiveNote(currentNote)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId])

  const addNote = () => {
    const id = ('000000000' + Math.random().toString(36).substring(2, 9)).slice(-9)
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .post('/api/personal_notes', { id, user_id: user.id })
      .then(() => mutate())
      .catch(console.log)
  }

  const removeNote = (id) => {
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .delete(`/api/personal_notes/${id}`)
      .then(() => {
        removeCacheNote('personal_notes', id)
        mutate()
      })
      .catch(console.log)
  }
  useEffect(() => {
    if (!activeNote) {
      return
    }
    const timer = setTimeout(() => {
      saveNote()
    }, 2000)
    return () => {
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNote])
  const removeAllNote = () => {
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .delete(`/api/personal_notes`, { data: { user_id: user?.id } })
      .then(() => {
        removeCacheAllNotes('personal-notes')
        mutate()
      })
      .catch(console.log)
  }

  return (
    <div className="relative">
      {!activeNote ? (
        <div>
          <div className="flex justify-end">
            <button
              className="btn-cyan text-xl font-bold mb-4 mr-4 right-0"
              onClick={addNote}
            >
              +
            </button>
            <button
              className="btn-gray-red mb-4 right-0"
              onClick={() => setIsOpenModal(true)}
              disabled={!notes?.length}
            >
              {t('RemoveAll')}
            </button>
          </div>
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
            isShowDelBtn
            delBtnChildren={<Trash className={'w-4 h-4 text-cyan-800'} />}
          />
        </div>
      ) : (
        <>
          <div
            className="absolute top-0 right-0 w-10 pr-3 cursor-pointer"
            onClick={() => {
              saveNote()
              setActiveNote(null)
              setNoteId(null)
            }}
          >
            <Close />
          </div>
          <Redactor
            classes={{
              title: 'bg-cyan-50 p-2 font-bold rounded-lg my-4 shadow-md mr-12',
              redactor:
                'bg-cyan-50 pb-20 overflow-hidden break-words p-4 px-4 rounded-lg my-4 shadow-md',
            }}
            activeNote={activeNote}
            setActiveNote={setActiveNote}
            placeholder={t('TextNewNote')}
          />
        </>
      )}
      <Modal isOpen={isOpenModal} closeHandle={() => setIsOpenModal(false)}>
        <div className="text-center">
          <div className="mb-4">
            {t('AreYouSureDelete') +
              ' ' +
              t(noteToDel ? noteToDel?.title : t('AllNotes').toLowerCase()) +
              '?'}
          </div>
          <button
            className="btn-cyan mx-2"
            onClick={() => {
              setIsOpenModal(false)
              if (noteToDel) {
                removeNote(noteToDel.id)
                setNoteToDel(null)
              } else {
                removeAllNote()
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
      <Toaster />
    </div>
  )
}

export default PersonalNotes
