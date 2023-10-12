import { useEffect, useState } from 'react'

import dynamic from 'next/dynamic'

import { useTranslation } from 'next-i18next'

import axios from 'axios'
import { toast } from 'react-hot-toast'

import { useCurrentUser } from 'lib/UserContext'

import Modal from 'components/Modal'

import { usePersonalNotes } from 'utils/hooks'
import { removeCacheNote, saveCacheNote } from 'utils/helper'

import Close from 'public/close.svg'
import Trash from 'public/trash.svg'
import Plus from 'public/plus.svg'

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
    sort: 'changed_at',
  })

  const removeCacheAllNotes = (key) => {
    localStorage.removeItem(key)
  }

  const saveNote = () => {
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
    axios
      .post('/api/personal_notes', { id, user_id: user.id })
      .then(() => mutate())
      .catch(console.log)
  }

  const removeNote = (id) => {
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
          <div className="flex gap-2">
            <button className="btn-tertiary p-3" onClick={addNote}>
              <Plus className="w-6 h-6 stroke-th-secondary-icons stroke-2" />
            </button>
            <div
              className="btn-tertiary px-5 py-3 flex gap-2 items-center"
              onClick={() => setIsOpenModal(true)}
              disabled={!notes?.length}
            >
              <Trash className="w-5 h-5 stroke-th-secondary-icons" />
              <span>{t('RemoveAll')}</span>
            </div>
          </div>
          <ListOfNotes
            notes={notes}
            removeNote={(e) => {
              setIsOpenModal(true)
              setNoteToDel(notes?.find((el) => el.id === e))
            }}
            setNoteId={setNoteId}
            classes={{
              item: 'flex justify-between items-start group my-3 bg-th-primary-background rounded-lg cursor-pointer shadow-md',
              title: 'p-2 mr-4 font-bold',
              text: 'px-2 h-10 overflow-hidden',
              delBtn: 'p-2 m-1 top-0 opacity-0 group-hover:opacity-100',
            }}
            isShowDelBtn
            delBtnChildren={<Trash className="w-4 h-4 stroke-th-primary-icons" />}
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
              title:
                'p-2 my-4 mr-12 bg-th-primary-background font-bold rounded-lg shadow-md',
              redactor:
                'pb-20 pt-4 my-4 bg-th-primary-background overflow-hidden break-words rounded-lg shadow-md',
            }}
            activeNote={activeNote}
            setActiveNote={setActiveNote}
            placeholder={t('TextNewNote')}
          />
        </>
      )}
      <Modal isOpen={isOpenModal} closeHandle={() => setIsOpenModal(false)}>
        <div className="flex flex-col gap-7 items-center">
          <div className="text-center text-2xl">
            {t('AreYouSureDelete') +
              ' ' +
              t(noteToDel ? noteToDel?.title : t('AllNotes').toLowerCase()) +
              '?'}
          </div>
          <div className="flex gap-7 w-1/2 text-th-primary-text">
            <button
              className="btn-base flex-1 bg-th-secondary-background hover:bg-th-quaternary-btn-background"
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
              className="btn-base flex-1 bg-th-secondary-background hover:bg-th-quaternary-btn-background"
              onClick={() => {
                setIsOpenModal(false)
                setTimeout(() => {
                  setNoteToDel(null)
                }, 1000)
              }}
            >
              {t('No')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default PersonalNotes
