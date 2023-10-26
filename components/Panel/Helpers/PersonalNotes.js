import { useEffect, useRef, useState } from 'react'

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

const TreeView = dynamic(
  () => import('@texttree/notepad-rcl').then((mod) => mod.TreeView),
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
  const [dataForTreeView, setDataForTreeView] = useState(convertNotesToTree(notes))

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

  const onDoubleClick = (nodeProps) => {
    const currentNote = notes.find((el) => el.id === noteId)
    setActiveNote(currentNote)
  }

  const addNode = (isFolder) => {
    const id = ('000000000' + Math.random().toString(36).substring(2, 9)).slice(-9)
    const title = isFolder ? 'new folder' : 'new note'
    const isFolderValue = isFolder ? true : false
    axios
      .post('/api/personal_notes', {
        id,
        user_id: user.id,
        isFolderValue,
        title,
      })
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

  function convertNotesToTree(notes, parentId = null) {
    const filteredNotes = notes?.filter((note) => note.parent_id === parentId)

    filteredNotes?.sort((a, b) => a.sorting - b.sorting)
    return filteredNotes?.map((note) => ({
      id: note.id,
      name: note.title,
      ...(note.is_folder && {
        children: convertNotesToTree(notes, note.id),
      }),
    }))
  }

  useEffect(() => {
    setDataForTreeView(convertNotesToTree(notes))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes])

  return (
    <div className="relative">
      {!activeNote ? (
        <div>
          <div className="flex justify-end">
            <button
              className="btn-cyan mb-4 mr-4 right-0 text-xl font-bold"
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
          <TreeView
            data={dataForTreeView}
            setSelectedNodeId={setNoteId}
            nodeHeight={57}
            onDoubleClick={onDoubleClick}
            classes={{
              nodeWrapper:
                'flex px-5 leading-[47px] cursor-pointer rounded-lg bg-gray-100 hover:bg-gray-200',
              nodeTextBlock: 'items-center',
            }}
            treeHeight={450}
            fileIcon={fileIcon}
            arrowDown={arrowDown}
            arrowRight={arrowRight}
            closeFolderIcon={closeFolderIcon}
            openFolderIcon={openFolderIcon}
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
              title: 'p-2 my-4 mr-12 bg-cyan-50 font-bold rounded-lg shadow-md',
              redactor:
                'pb-20 pt-4 my-4 bg-cyan-50 overflow-hidden break-words rounded-lg shadow-md',
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
          <div className="flex gap-7 w-1/2">
            <button
              className="btn-secondary flex-1"
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
              className="btn-secondary flex-1"
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
