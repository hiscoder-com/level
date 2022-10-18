import { useEffect, useState } from 'react'

import dynamic from 'next/dynamic'

import axios from 'axios'

import { useCurrentUser } from 'lib/UserContext'
import { useTeamNotes, useProject } from 'utils/hooks'
import { useRouter } from 'next/router'
import Close from 'public/close.svg'
import Waste from 'public/waste.svg'
const icons = {
  openedFolder: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24px"
      viewBox="0 0 24 24"
      width="24px"
      fill="#000000"
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" />
    </svg>
  ),
  closedFolder: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24px"
      viewBox="0 0 24 24"
      width="24px"
      fill="#000000"
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
    </svg>
  ),
  note: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24px"
      viewBox="0 0 24 24"
      width="24px"
      fill="#000000"
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
    </svg>
  ),
}

const Redactor = dynamic(
  () => import('@texttree/notepad-rcl').then((mod) => mod.Redactor),
  {
    ssr: false,
  }
)

const ListOfNotesTree = dynamic(
  () => import('@texttree/notepad-rcl').then((mod) => mod.ListOfNotesTree),
  {
    ssr: false,
  }
)

function TeamNotes() {
  const [noteId, setNoteId] = useState(null)
  const [activeNote, setActiveNote] = useState(null)
  const { user } = useCurrentUser()
  const router = useRouter()
  const { code } = router.query
  const [project] = useProject({ token: user?.access_token, code: 'ru_rlob' })
  const [notes, { loading, error, mutate }] = useTeamNotes({
    token: user?.access_token,
    project_id: project?.id,
  })

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
      .delete(`/api/team_notes/${id}`, { id, project_id: project?.id })
      .then(() => mutate())
      .catch((err) => console.log(err))
  }
  useEffect(() => {
    const timer = setTimeout(() => {
      axios.defaults.headers.common['token'] = user?.access_token
      axios
        .put(`/api/team_notes/${noteId}`, activeNote)
        .then(() => mutate())
        .catch((err) => console.log(err))

      return () => {
        clearTimeout(timer)
      }
    }, 1000)

    // return () => {}
  }, [activeNote])

  return (
    <div className="relative">
      {!activeNote ? (
        <div>
          <div className="flex justify-end">
            <button className="   btn-cyan mb-4 right-0" onClick={addNote}>
              Add
            </button>
          </div>
          <ListOfNotesTree notes={notes} icons={icons} setActiveNote={setActiveNote} />
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
              title: 'bg-cyan-50 p-2 font-bold rounded-lg my-4 shadow-md',
              redactor:
                'bg-cyan-50 overflow-hidden break-words p-4 px-4 rounded-lg my-4 shadow-md',
            }}
            activeNote={activeNote}
            setActiveNote={setActiveNote}
          />
        </>
      )}
    </div>
  )
}

export default TeamNotes
