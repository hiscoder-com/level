import { useEffect, useRef, useState } from 'react'

import dynamic from 'next/dynamic'

import { useTranslation } from 'next-i18next'

import axios from 'axios'
import { toast } from 'react-hot-toast'

import { useCurrentUser } from 'lib/UserContext'
import useSupabaseClient from 'utils/supabaseClient'

import Modal from 'components/Modal'

import { usePersonalNotes } from 'utils/hooks'
import { removeCacheNote, saveCacheNote } from 'utils/helper'

import Close from 'public/close.svg'
import Trash from 'public/trash.svg' // использовать!

const Redactor = dynamic(
  () => import('@texttree/notepad-rcl').then((mod) => mod.Redactor),
  {
    ssr: false,
  }
)

const ContextMenu = dynamic(
  () => import('@texttree/notepad-rcl').then((mod) => mod.ContextMenu),
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
  const treeRef = useRef(null)
  const [contextMenuEvent, setContextMenuEvent] = useState(null)
  const [hoveredNodeId, setHoveredNodeId] = useState(null)
  const [noteId, setNoteId] = useState('')
  const [activeNote, setActiveNote] = useState(null)
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [currentNodeProps, setCurrentNodeProps] = useState(null)
  const { t } = useTranslation(['common'])
  const { user } = useCurrentUser()
  const [notes, { mutate }] = usePersonalNotes({
    sort: 'sorting',
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

  const handleRenameNode = (newTitle, id) => {
    axios
      .put(`/api/personal_notes/${id}`, { title: newTitle })
      .then(() => {
        console.log('Note renamed successfully')
        removeCacheNote('personal_notes', id)
        mutate()
      })
      .catch((error) => {
        console.log('Failed to rename note:', error)
      })
  }

  const removeNode = () => {
    currentNodeProps?.tree.delete(currentNodeProps.node.id)
  }

  const handleRemoveNode = ({ ids }) => {
    axios
      .delete(`/api/personal_notes/${ids[0]}`)
      .then(() => {
        removeCacheNote('personal_notes', ids[0])
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

  const fileIcon = (
    <svg
      width="15"
      height="15"
      viewBox="0 0 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.4707 22.9981H9.9309V24.7005H14.4707V22.9981ZM1.70244 14.7696V10.2298H7.31844e-07V14.7696H1.70244ZM22.6992 14.2735V14.7696H24.4016V14.2735H22.6992ZM15.4822 4.11362L19.9753 8.15737L21.1141 6.89195L16.6212 2.84821L15.4822 4.11362ZM24.4016 14.2735C24.4016 12.3573 24.4188 11.144 23.9353 10.0584L22.3802 10.751C22.6821 11.4289 22.6992 12.2069 22.6992 14.2735H24.4016ZM19.9753 8.15737C21.5114 9.53984 22.0783 10.0731 22.3802 10.751L23.9353 10.0584C23.4518 8.97272 22.5385 8.17384 21.1141 6.89195L19.9753 8.15737ZM9.96472 2.00133C11.76 2.00133 12.4375 2.01447 13.0413 2.24617L13.6512 0.656739C12.6844 0.285743 11.6311 0.298886 9.96472 0.298886V2.00133ZM16.6212 2.84821C15.3886 1.7389 14.6179 1.02769 13.6512 0.656739L13.0413 2.24617C13.6453 2.47793 14.1547 2.91878 15.4822 4.11362L16.6212 2.84821ZM9.9309 22.9981C7.76674 22.9981 6.22924 22.9963 5.06289 22.8394C3.92101 22.686 3.26314 22.398 2.78281 21.9177L1.579 23.1216C2.42837 23.9709 3.50538 24.3478 4.83604 24.5268C6.1422 24.7023 7.81486 24.7005 9.9309 24.7005V22.9981ZM7.31844e-07 14.7696C7.31844e-07 16.8856 -0.00180379 18.5583 0.173797 19.8645C0.352701 21.1951 0.729644 22.2722 1.579 23.1216L2.78281 21.9177C2.30248 21.4374 2.01458 20.7795 1.86106 19.6377C1.70425 18.4713 1.70244 16.9338 1.70244 14.7696H7.31844e-07ZM14.4707 24.7005C16.5868 24.7005 18.2595 24.7023 19.5656 24.5268C20.8962 24.3478 21.9733 23.9709 22.8227 23.1216L21.6188 21.9177C21.1385 22.398 20.4806 22.686 19.3388 22.8394C18.1724 22.9963 16.6349 22.9981 14.4707 22.9981V24.7005ZM22.6992 14.7696C22.6992 16.9338 22.6974 18.4713 22.5405 19.6377C22.3871 20.7795 22.0991 21.4374 21.6188 21.9177L22.8227 23.1216C23.672 22.2722 24.0489 21.1951 24.2279 19.8645C24.4035 18.5583 24.4016 16.8856 24.4016 14.7696H22.6992ZM1.70244 10.2298C1.70244 8.06562 1.70425 6.52812 1.86106 5.36177C2.01458 4.2199 2.30248 3.56202 2.78281 3.08169L1.579 1.87789C0.729644 2.72726 0.352701 3.80427 0.173797 5.13493C-0.00180379 6.44108 7.31844e-07 8.11374 7.31844e-07 10.2298H1.70244ZM9.96472 0.298886C7.83733 0.298886 6.1565 0.297092 4.845 0.472614C3.50966 0.651336 2.42903 1.02787 1.579 1.87789L2.78281 3.08169C3.26248 2.60204 3.92238 2.31372 5.07083 2.16002C6.24313 2.00312 7.78936 2.00133 9.96472 2.00133V0.298886Z"
        fill="#292D32"
      />
      <path
        opacity="0.5"
        d="M5.39258 15.3379H14.4723"
        stroke="#292D32"
        strokeWidth="1.70244"
        strokeLinecap="round"
      />
      <path
        opacity="0.5"
        d="M5.39258 19.3105H11.6349"
        stroke="#292D32"
        strokeWidth="1.70244"
        strokeLinecap="round"
      />
      <path
        opacity="0.5"
        d="M13.3359 1.7168V4.5542C13.3359 7.22932 13.3359 8.56688 14.167 9.39794C14.9981 10.229 16.3356 10.229 19.0107 10.229H23.5506"
        stroke="#292D32"
        strokeWidth="1.70244"
      />
    </svg>
  )

  const openFolderIcon = (
    <svg
      width="15"
      height="15"
      viewBox="0 0 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M23.4605 15.093L23.0065 20.7678C22.8363 22.5043 22.7001 23.8322 19.6243 23.8322H5.34658C2.27084 23.8322 2.13464 22.5043 1.9644 20.7678L1.51041 15.093C1.41962 14.151 1.71471 13.2771 2.24814 12.6075C2.25949 12.5961 2.25949 12.5961 2.27084 12.5848C2.89506 11.8243 3.83708 11.3477 4.89259 11.3477H20.0783C21.1338 11.3477 22.0645 11.8243 22.6774 12.5621C22.6887 12.5734 22.7001 12.5848 22.7001 12.5961C23.2562 13.2657 23.5626 14.1397 23.4605 15.093Z"
        stroke="#292D32"
        strokeWidth="1.70244"
        strokeMiterlimit="10"
      />
      <path
        opacity="0.4"
        d="M2.83789 11.8366V5.99155C2.83789 2.13268 3.80261 1.16797 7.66147 1.16797H9.10287C10.5443 1.16797 10.8734 1.59925 11.4182 2.32563L12.8596 4.25506C13.2228 4.73174 13.4384 5.02683 14.4031 5.02683H17.2973C21.1561 5.02683 22.1209 5.99155 22.1209 9.85041V11.882"
        stroke="#292D32"
        strokeWidth="1.70244"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        opacity="0.4"
        d="M9.56836 18.1582H15.4021"
        stroke="#292D32"
        strokeWidth="1.70244"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )

  const closeFolderIcon = (
    <svg
      width="15"
      height="15"
      viewBox="0 0 26 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        opacity="0.4"
        d="M15.6318 15.3926H9.95703"
        stroke="#292D32"
        strokeWidth="1.70244"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24.2226 11.365V18.1748C24.2226 22.7146 23.0877 23.8496 18.5478 23.8496H7.19824C2.6584 23.8496 1.52344 22.7146 1.52344 18.1748V6.82519C1.52344 2.28535 2.6584 1.15039 7.19824 1.15039H8.90068C10.6031 1.15039 10.9777 1.64977 11.6246 2.51234L13.327 4.78226C13.7583 5.34974 14.008 5.69023 15.143 5.69023H18.5478C23.0877 5.69023 24.2226 6.82519 24.2226 11.365Z"
        stroke="#292D32"
        strokeWidth="1.70244"
        strokeMiterlimit="10"
      />
    </svg>
  )

  const arrowRight = (
    <svg
      width="11"
      height="11"
      viewBox="0 0 7 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.25391 9.74805L5.52295 5.5078L1.26828 1.25313"
        stroke="#353535"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )

  const arrowDown = (
    <svg
      width="11"
      height="11"
      viewBox="0 0 11 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 1.5L5.24747 5.76186L9.49493 1.5"
        stroke="#353535"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )

  const handleContextMenu = (event) => {
    setNoteId(hoveredNodeId)
    setContextMenuEvent({ event })
  }

  const handleRename = () => {
    currentNodeProps?.node.edit()
  }

  const menuItems = [
    { id: 'adding_a_note', label: '+ add note', action: () => addNode(false) },
    { id: 'adding_a_folder', label: '+ add folder', action: () => addNode(true) },
    { id: 'rename', label: '✏️ Rename', action: handleRename },
    { id: 'delete', label: '🗑️ Delete', action: () => setIsOpenModal(true) },
  ]

  const supabase = useSupabaseClient()

  const handleDragDrop = async ({ dragIds, parentId, index }) => {
    const { error } = await supabase.rpc('move_node', {
      new_sorting_value: index,
      dragged_node_id: dragIds[0],
      new_parent_id: parentId,
    })

    if (error) {
      console.error('Ошибка при перемещении узла:', error)
    } else {
      console.log('Узел успешно перемещен!')
      removeCacheAllNotes('personal-notes')
      mutate()
    }
  }

  return (
    <div className="relative">
      {!activeNote ? (
        <div>
          <div className="flex justify-end">
            <button
              className="btn-cyan mb-4 mr-4 right-0 text-xl font-bold"
              onClick={() => addNode(false)}
            >
              +
            </button>
            <button
              className="btn-gray-red mb-4 mr-4 right-0 text-xl font-bold"
              onClick={() => addNode(true)}
            >
              +
            </button>
            <button
              className="btn-gray-red mb-4 right-0"
              onClick={() => {
                setCurrentNodeProps(null)
                setIsOpenModal(true)
              }}
              disabled={!notes?.length}
            >
              {t('RemoveAll')}
            </button>
          </div>
          <TreeView
            data={dataForTreeView}
            setSelectedNodeId={setNoteId}
            nodeHeight={57}
            treeRef={treeRef}
            onDoubleClick={onDoubleClick}
            classes={{
              nodeWrapper:
                'flex px-5 leading-[47px] cursor-pointer rounded-lg bg-gray-100 hover:bg-gray-200',
              nodeTextBlock: 'items-center',
            }}
            treeHeight={440}
            fileIcon={fileIcon}
            arrowDown={arrowDown}
            arrowRight={arrowRight}
            closeFolderIcon={closeFolderIcon}
            openFolderIcon={openFolderIcon}
            handleContextMenu={handleContextMenu}
            selectedNodeId={noteId}
            customContextMenu={true}
            hoveredNodeId={hoveredNodeId}
            setHoveredNodeId={setHoveredNodeId}
            treeWidth={320}
            getCurrentNodeProps={setCurrentNodeProps}
            handleRenameNode={handleRenameNode}
            handleTreeEventDelete={handleRemoveNode}
            handleDragDrop={handleDragDrop}
          />
          <ContextMenu
            setSelectedNodeId={setNoteId}
            selectedNodeId={noteId}
            data={contextMenuEvent}
            menuItems={menuItems}
            treeRef={treeRef}
            classes={{
              menuItem: 'py-1 pr-7 pl-2.5 cursor-pointer bg-gray-100 hover:bg-gray-200',
              menuWrapper: 'fixed z-50',
              menuContainer:
                'absolute border rounded z-[100] whitespace-nowrap bg-white shadow',
              emptyMenu: 'p-2.5 cursor-pointer text-gray-300',
            }}
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
              t(
                currentNodeProps
                  ? currentNodeProps.node.data.name
                  : t('AllNotes').toLowerCase()
              ) +
              '?'}
          </div>
          <div className="flex gap-7 w-1/2">
            <button
              className="btn-secondary flex-1"
              onClick={() => {
                setIsOpenModal(false)
                if (currentNodeProps) {
                  removeNode()
                  setCurrentNodeProps(null)
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
                  setCurrentNodeProps(null)
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
