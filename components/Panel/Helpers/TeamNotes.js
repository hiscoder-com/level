import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'

import axios from 'axios'
import { useTranslation } from 'next-i18next'
import { toast } from 'react-hot-toast'
import { useRecoilValue } from 'recoil'

import Modal from 'components/Modal'
import MenuButtons from '../UI/MenuButtons'

import { useCurrentUser } from 'lib/UserContext'
import useSupabaseClient from 'utils/supabaseClient'
import { checkLSVal, convertNotesToTree, formationJSONToTree } from 'utils/helper'
import { useTeamNotes, useProject, useAccess, useAllTeamlNotes } from 'utils/hooks'
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
import Export from 'public/export.svg'
import Import from 'public/import.svg'
import Close from 'public/close.svg'
import Progress from 'public/progress.svg'

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

function TeamNotes({ config }) {
  const [contextMenuEvent, setContextMenuEvent] = useState(null)
  const [hoveredNodeId, setHoveredNodeId] = useState(null)
  const [currentNodeProps, setCurrentNodeProps] = useState(null)
  const [isShowMenu, setIsShowMenu] = useState(false)
  const [noteId, setNoteId] = useState(localStorage.getItem('selectedTeamNoteId') || '')
  const [activeNote, setActiveNote] = useState(() => {
    return checkLSVal('activeTeamNote', {}, 'object')
  })
  const [isOpenModal, setIsOpenModal] = useState(false)
  const { t } = useTranslation(['common', 'error'])
  const [term, setTerm] = useState('')
  const { user } = useCurrentUser()
  const [allNotes] = useAllTeamlNotes()
  const isRtl = config?.isRtl || false

  const {
    query: { project: code },
  } = useRouter()
  const [project] = useProject({ code })
  const [notes, { isLoading, mutate }] = useTeamNotes({
    project_id: project?.id,
  })
  const [{ isModeratorAccess }] = useAccess({
    user_id: user?.id,
    code,
  })
  const [dataForTreeView, setDataForTreeView] = useState(convertNotesToTree(notes))
  const supabase = useSupabaseClient()
  useEffect(() => {
    mutate()
  }, [mutate])

  function generateUniqueId(existingIds) {
    let newId
    do {
      newId = ('000000000' + Math.random().toString(36).substring(2, 9)).slice(-9)
    } while (existingIds.includes(newId))
    return newId
  }

  function parseNotesWithTopFolder(notes, project_id, deleted_at) {
    const exportFolderId = generateUniqueId(allNotes)
    const exportFolderDateTime = new Date().toISOString().replace(/[:.]/g, '-')

    const exportFolder = {
      id: exportFolderId,
      project_id,
      title: `export-${exportFolderDateTime}`,
      data: null,
      created_at: new Date().toISOString(),
      changed_at: new Date().toISOString(),
      deleted_at,
      is_folder: true,
      parent_id: null,
      sorting: 0,
    }

    const parsedNotes = parseNotes(notes, project_id, exportFolderId)
    return [exportFolder, ...parsedNotes]
  }

  function parseNotes(notes, project_id, parentId = null) {
    return notes.reduce((acc, note) => {
      const id = generateUniqueId(allNotes)
      const parsedNote = {
        id: id,
        project_id,
        title: note.title,
        data: parseData(note.data),
        created_at: note.created_at,
        changed_at: new Date().toISOString(),
        deleted_at: note.deleted_at,
        is_folder: note.is_folder,
        parent_id: parentId,
        sorting: note.sorting,
      }

      acc.push(parsedNote)

      if (note.children?.length > 0) {
        const childNotes = parseNotes(note.children, project_id, id)
        acc = acc.concat(childNotes)
      }

      return acc
    }, [])
  }

  function parseData(data) {
    if (!data) {
      return null
    }

    return {
      blocks: data.blocks || [],
      version: data.version,
      time: data.time,
    }
  }

  const importNotes = async () => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = '.json'

    fileInput.addEventListener('change', async (event) => {
      try {
        const file = event.target.files[0]
        if (!file) {
          throw new Error(t('error:NoFileSelected'))
        }

        const fileContents = await file.text()
        if (!fileContents.trim()) {
          throw new Error(t('error:EmptyFileContent'))
        }

        const importedData = JSON.parse(fileContents)
        if (importedData.type !== 'team_notes') {
          throw new Error(t('error:ContentError'))
        }
        const parsedNotes = parseNotesWithTopFolder(
          importedData.data,
          project.id,
          project.deleted_at
        )

        for (const note of parsedNotes) {
          console.log(note)
          bulkNode(note)
        }
      } catch (error) {
        toast.error(error.message)
      }
    })

    fileInput.click()
  }

  function exportNotes() {
    try {
      if (!notes || !notes.length) {
        throw new Error(t('error:NoData'))
      }
      const transformedData = formationJSONToTree(notes)
      const jsonContent = JSON.stringify(
        { type: 'team_notes', data: transformedData },
        null,
        2
      )
      const blob = new Blob([jsonContent], { type: 'application/json' })

      const downloadLink = document.createElement('a')
      const currentDate = new Date()
      const formattedDate = currentDate.toISOString().split('T')[0]

      const fileName = `team_notes_${formattedDate}.json`

      const url = URL.createObjectURL(blob)

      downloadLink.href = url
      downloadLink.download = fileName

      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)

      URL.revokeObjectURL(url)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const bulkNode = (note) => {
    axios
      .post('/api/team_notes/bulk_insert', {
        note: note,
      })
      .then(() => mutate())
      .catch(console.log)
  }

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

  const changeNode = () => {
    const currentNote = notes.find((el) => el.id === hoveredNodeId)
    setActiveNote(currentNote)
  }

  const addNode = (isFolder = false) => {
    const id = generateUniqueId(allNotes)
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
    localStorage.setItem('activeTeamNote', JSON.stringify(activeNote))
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
    noteId && localStorage.setItem('selectedTeamNoteId', noteId)
  }, [noteId])

  const handleContextMenu = (event) => {
    setIsShowMenu(true)
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

  const classNameButtonIcon = 'flex items-center gap-2.5 py-1 pl-2.5 ltr:pr-7 rtl:pr-2'
  const menuItems = {
    contextMenu: [
      {
        id: 'adding_note',
        buttonContent: (
          <span className={classNameButtonIcon}>
            <FileIcon /> {t('NewDocument')}
          </span>
        ),
        action: () => addNode(),
      },
      {
        id: 'adding_folder',
        buttonContent: (
          <span className={classNameButtonIcon}>
            <CloseFolder /> {t('NewFolder')}
          </span>
        ),
        action: () => addNode(true),
      },
      {
        id: 'rename',
        buttonContent: (
          <span className={classNameButtonIcon}>
            <Rename /> {t('Rename')}
          </span>
        ),
        action: handleRename,
      },
      {
        id: 'delete',
        buttonContent: (
          <span className={classNameButtonIcon}>
            <Trash className="w-4" /> {t('Delete')}
          </span>
        ),
        action: () => setIsOpenModal(true),
      },
    ],
    menu: [
      {
        id: 'export',
        buttonContent: (
          <span className={classNameButtonIcon}>
            <Export className="w-4 stroke-2" /> {t('Export')}
          </span>
        ),
        action: () => exportNotes(),
      },
      {
        id: 'import',
        buttonContent: (
          <span className={classNameButtonIcon}>
            <Import className="w-4 stroke-2" /> {t('Import')}
          </span>
        ),
        action: () => importNotes(true),
      },
      {
        id: 'remove',
        buttonContent: (
          <span className={classNameButtonIcon}>
            <Trash className="w-4 stroke-2" /> {t('RemoveAll')}
          </span>
        ),
        action: () => setIsOpenModal(true),
      },
    ],
    container: {
      className: 'absolute border rounded z-[100] whitespace-nowrap bg-white shadow',
    },
    item: {
      className: 'cursor-pointer bg-th-secondary-100 hover:bg-th-secondary-200',
    },
  }
  const dropMenuItems = {
    dots: menuItems.menu.filter((menuItem) => menuItem.id !== 'remove'),
    plus: menuItems.contextMenu.filter((menuItem) =>
      ['adding_note', 'adding_folder'].includes(menuItem.id)
    ),
  }

  const dropMenuClassNames = { container: menuItems.container, item: menuItems.item }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="relative">
      {!activeNote || !Object.keys(activeNote)?.length ? (
        <div>
          {isModeratorAccess && (
            <div className="flex ltr:justify-end rtl:justify-start w-full">
              <MenuButtons classNames={dropMenuClassNames} menuItems={dropMenuItems} />
            </div>
          )}
          <div className="relative flex items-center mb-4">
            <input
              className="input-primary flex-1"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder={t('Search')}
            />
            {term && (
              <Close
                className="absolute р-6 w-6 z-10 cursor-pointer ltr:right-1 rtl:left-1"
                onClick={() => setTerm('')}
              />
            )}
          </div>
          {!isLoading || notes?.length ? (
            <TreeView
              term={term}
              selection={noteId}
              handleDeleteNode={handleRemoveNode}
              classes={{
                nodeWrapper:
                  'px-5 leading-[47px] text-lg cursor-pointer rounded-lg bg-th-secondary-100 hover:bg-th-secondary-200 ltr:flex',
                nodeTextBlock: 'items-center truncate',
              }}
              data={dataForTreeView}
              setSelectedNodeId={setNoteId}
              selectedNodeId={noteId}
              treeWidth="w-full"
              icons={icons}
              handleOnClick={changeNode}
              handleContextMenu={handleContextMenu}
              hoveredNodeId={hoveredNodeId}
              setHoveredNodeId={setHoveredNodeId}
              getCurrentNodeProps={setCurrentNodeProps}
              handleRenameNode={handleRenameNode}
              handleDragDrop={isModeratorAccess ? handleDragDrop : null}
              openByDefault={false}
              isRtl={isRtl}
            />
          ) : (
            <Progress className="progress-custom-colors w-14 animate-spin stroke-th-primary-100 mx-auto" />
          )}
          {isModeratorAccess && (
            <ContextMenu
              setIsVisible={setIsShowMenu}
              isVisible={isShowMenu}
              nodeProps={currentNodeProps}
              menuItems={menuItems.contextMenu}
              clickMenuEvent={contextMenuEvent}
              classes={{
                menuItem: menuItems.item.className,
                menuContainer: menuItems.container.className,
                emptyMenu: 'p-2.5 cursor-pointer text-gray-300',
              }}
              isRtl={isRtl}
            />
          )}
        </div>
      ) : (
        <>
          <div
            className="flex w-fit p-1 cursor-pointer hover:opacity-70 rounded-full bg-th-secondary-100"
            onClick={() => {
              saveNote()
              setActiveNote(null)
              setIsShowMenu(false)
              localStorage.setItem('activeTeamNote', JSON.stringify({}))
            }}
          >
            <Back className="w-8 stroke-th-primary-200" />
          </div>
          <Redactor
            classes={{
              title: 'p-2 my-4 font-bold bg-th-secondary-100 rounded-lg shadow-md',
              redactor:
                'pb-20 pt-4 px-4 my-4 bg-th-secondary-100 overflow-hidden break-words rounded-lg shadow-md',
            }}
            activeNote={activeNote}
            setActiveNote={setActiveNote}
            readOnly={!isModeratorAccess}
            placeholder={isModeratorAccess ? t('TextNewNote') : ''}
            emptyTitle={t('EmptyTitle')}
            isSelectableTitle
            isRtl={isRtl}
          />
        </>
      )}
      <Modal isOpen={isOpenModal} closeHandle={() => setIsOpenModal(false)}>
        <div className="flex flex-col gap-7 items-center">
          <div className="text-center text-2xl">
            {t('AreYouSureDelete') + ' ' + currentNodeProps?.node.data.name || '' + '?'}
          </div>
          <div className="flex gap-7 w-1/2">
            <button
              className="btn-secondary flex-1"
              onClick={() => {
                setIsOpenModal(false)
                removeNode()
              }}
            >
              {t('Yes')}
            </button>
            <button
              className="btn-secondary flex-1"
              onClick={() => setIsOpenModal(false)}
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
