import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'

import axios from 'axios'
import { useTranslation } from 'next-i18next'
import { toast } from 'react-hot-toast'
import { useRecoilValue } from 'recoil'

import Modal from 'components/Modal'

import { useCurrentUser } from 'lib/UserContext'
import useSupabaseClient from 'utils/supabaseClient'
import { convertNotesToTree } from 'utils/helper'
import { useTeamNotes, useProject, useAccess } from 'utils/hooks'
import { removeCacheNote, saveCacheNote } from 'utils/helper'
import { projectIdState } from 'components/state/atoms'

import Back from 'public/left.svg'
import Trash from 'public/trash.svg'
import FileIcon from 'public/file-icon.svg'
import CloseFolder from 'public/close-folder.svg'
import OpenFolder from 'public/open-folder.svg'
import ArrowDown from 'public/folder-arrow-down.svg'
import ArrowRight from 'public/folder-arrow-right.svg'
import Rename from 'public/rename.svg'

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

const icons = {
  file: <FileIcon className={'w-6 h-6'} />,
  arrowDown: <ArrowDown className={'stroke-2'} />,
  arrowRight: <ArrowRight className={'stroke-2'} />,
  openFolder: <OpenFolder className={'w-6 h-6 stroke-[1.7]'} />,
  closeFolder: <CloseFolder className={'w-6 h-6'} />,
}

function TeamNotes() {
  const [contextMenuEvent, setContextMenuEvent] = useState(null)
  const [hoveredNodeId, setHoveredNodeId] = useState(null)
  const [currentNodeProps, setCurrentNodeProps] = useState(null)
  const [noteId, setNoteId] = useState(localStorage.getItem('selectedTeamNoteId') || '')
  const [activeNote, setActiveNote] = useState(null)
  const [isOpenModal, setIsOpenModal] = useState(false)
  const { t } = useTranslation(['common'])
  const { user } = useCurrentUser()
  const {
    query: { project: code },
  } = useRouter()
  const [project] = useProject({ code })
  const [notes, { mutate }] = useTeamNotes({
    project_id: project?.id,
  })
  const [{ isModeratorAccess }] = useAccess({
    user_id: user?.id,
    code,
  })
  const [dataForTreeView, setDataForTreeView] = useState(convertNotesToTree(notes))
  const supabase = useSupabaseClient()

  const saveNote = () => {
    axios
      .put(`/api/team_notes/${activeNote?.id}`, activeNote)
      .then(() => {
        saveCacheNote('team-notes', activeNote, user)
        mutate()
      })
      .catch((err) => {
        toast.error(t('SaveFailed'))
        console.log(err)
      })
  }

  const onDoubleClick = () => {
    const currentNote = notes.find((el) => el.id === noteId)
    setActiveNote(currentNote)
  }

  const addNode = (isFolder = false) => {
    const id = ('000000000' + Math.random().toString(36).substring(2, 9)).slice(-9)
    const title = isFolder ? t('NewFolder') : t('NewNote')

    axios
      .post('/api/team_notes', {
        id,
        project_id: project?.id,
        isFolder: isFolder === true,
        title,
      })
      .then(() => mutate())
      .catch(console.log)
  }

  const handleRenameNode = (newTitle, id) => {
    if (!newTitle.trim()) {
      newTitle = t('EmptyTitle')
    }
    axios
      .put(`/api/team_notes/${id}`, { title: newTitle })
      .then(() => {
        console.log('Note renamed successfully')
        removeCacheNote('team_notes', id)
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
      .delete(`/api/team_notes/${ids[0]}`)
      .then(() => {
        removeCacheNote('team-notes', ids[0])
        mutate()
      })
      .catch(console.log)
  }

  useEffect(() => {
    if (!activeNote || !isModeratorAccess) {
      return
    }

    const timer = setTimeout(() => {
      saveNote()
    }, 2000)
    return () => {
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNote, isModeratorAccess])

  useEffect(() => {
    setDataForTreeView(convertNotesToTree(notes))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes])

  useEffect(() => {
    localStorage.setItem('selectedTeamNoteId', noteId)
  }, [noteId])

  const handleContextMenu = (event) => {
    setNoteId(hoveredNodeId)
    setContextMenuEvent({ event })
  }

  const handleRename = () => {
    currentNodeProps?.node.edit()
  }

  const projectId = useRecoilValue(projectIdState)

  const handleDragDrop = async ({ dragIds, parentId, index }) => {
    const { error } = await supabase.rpc('move_node', {
      project_id: projectId,
      new_sorting_value: index,
      dragged_node_id: dragIds[0],
      new_parent_id: parentId,
      table_name: 'team_notes',
    })

    if (error) {
      console.error('Error when moving node:', error)
    } else {
      mutate()
    }
  }

  const menuItems = [
    {
      id: 'adding_a_note',
      buttonContent: (
        <span className={'flex items-center gap-2.5 py-1 pr-7 pl-2.5'}>
          <FileIcon /> {t('NewDocument')}
        </span>
      ),
      action: () => addNode(),
    },
    {
      id: 'adding_a_folder',
      buttonContent: (
        <span className={'flex items-center gap-2.5 py-1 pr-7 pl-2.5 border-b-2'}>
          <CloseFolder /> {t('NewFolder')}
        </span>
      ),
      action: () => addNode(true),
    },
    {
      id: 'rename',
      buttonContent: (
        <span className={'flex items-center gap-2.5 py-1 pr-7 pl-2.5'}>
          <Rename /> {t('Rename')}
        </span>
      ),
      action: handleRename,
    },
    {
      id: 'delete',
      buttonContent: (
        <span className={'flex items-center gap-2.5 py-1 pr-7 pl-2.5'}>
          <Trash className={'w-4'} /> {t('Delete')}
        </span>
      ),
      action: () => setIsOpenModal(true),
    },
  ]

  return (
    <div className="relative">
      {!activeNote ? (
        <div>
          {isModeratorAccess && (
            <div className="flex gap-2">
              <button className="btn-tertiary p-3" onClick={() => addNode()}>
                <FileIcon className="w-6 h-6 fill-th-text-secondary" />
              </button>
              <button className="btn-tertiary p-3" onClick={() => addNode(true)}>
                <CloseFolder className="w-6 h-6 stroke-th-text-secondary" />
              </button>
            </div>
          )}
          <TreeView
            selection={noteId}
            handleDeleteNode={handleRemoveNode}
            classes={{
              nodeWrapper:
                'flex px-5 leading-[47px] text-lg cursor-pointer rounded-lg bg-th-secondary-100 hover:bg-th-secondary-200',
              nodeTextBlock: 'items-center truncate',
            }}
            data={dataForTreeView}
            setSelectedNodeId={setNoteId}
            selectedNodeId={noteId}
            treeWidth={'w-full'}
            icons={icons}
            handleDoubleClick={onDoubleClick}
            handleContextMenu={handleContextMenu}
            hoveredNodeId={hoveredNodeId}
            setHoveredNodeId={setHoveredNodeId}
            getCurrentNodeProps={setCurrentNodeProps}
            handleRenameNode={handleRenameNode}
            handleDragDrop={isModeratorAccess ? handleDragDrop : null}
            openByDefault={false}
          />
          {isModeratorAccess && (
            <ContextMenu
              setSelectedNodeId={setNoteId}
              selectedNodeId={noteId}
              nodeProps={currentNodeProps}
              menuItems={menuItems}
              clickMenuEvent={contextMenuEvent}
              classes={{
                menuItem: 'cursor-pointer bg-th-secondary-100 hover:bg-th-secondary-200',
                menuContainer:
                  'absolute border rounded z-[100] whitespace-nowrap bg-white shadow',
                emptyMenu: 'p-2.5 cursor-pointer text-gray-300',
              }}
            />
          )}
        </div>
      ) : (
        <>
          <div
            className="absolute top-1 right-0 w-10 pr-3 cursor-pointer"
            onClick={() => {
              saveNote()
              setActiveNote(null)
            }}
          >
            <Back className="stroke-th-text-primary" />
          </div>
          <Redactor
            classes={{
              title: 'p-2 my-4 mr-12 font-bold bg-th-secondary-100 rounded-lg shadow-md',
              redactor:
                'pb-20 pt-4 px-4 my-4 bg-th-secondary-100 overflow-hidden break-words rounded-lg shadow-md',
            }}
            activeNote={activeNote}
            setActiveNote={setActiveNote}
            readOnly={!isModeratorAccess}
            placeholder={isModeratorAccess ? t('TextNewNote') : ''}
            emptyTitle={t('EmptyTitle')}
          />
        </>
      )}
      <Modal isOpen={isOpenModal} closeHandle={() => setIsOpenModal(false)}>
        <div className="flex flex-col gap-7 items-center">
          <div className="text-center text-2xl">
            {t('AreYouSureDelete') + ' ' + t(currentNodeProps?.node.data.name) + '?'}
          </div>
          <div className="flex gap-7 w-1/2">
            <button
              className="btn-secondary flex-1"
              onClick={() => {
                setIsOpenModal(false)
                if (currentNodeProps) {
                  removeNode()
                  setCurrentNodeProps(null)
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

export default TeamNotes
