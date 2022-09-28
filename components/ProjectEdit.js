import { Fragment, useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import axios from 'axios'

import { Switch } from '@headlessui/react'

import Modal from './Modal'
import { supabase } from 'utils/supabaseClient'
import {
  useCoordinators,
  useModerators,
  usePermissions,
  useProject,
  useProjectRole,
  useTranslators,
  useUsers,
} from 'utils/hooks'
import { useCurrentUser } from 'lib/UserContext'
import User from 'public/user.svg'

function ProjectEdit() {
  const {
    query: { code },
  } = useRouter()
  const { user } = useCurrentUser()
  const [users] = useUsers(user?.access_token)
  const [openAssignTranslator, setOpenAssignTranslator] = useState(false)
  const [selectedTranslator, setSelectedTranslator] = useState(null)

  const [selectedUser, setSelectedUser] = useState(null)
  const role = useProjectRole({
    token: user?.access_token,
    code,
    userId: user?.id,
    isAdmin: user?.is_admin,
  })

  const [permissions] = usePermissions({ token: user?.access_token, role })
  const [project] = useProject({ token: user?.access_token, code })
  const [translators, { mutate }] = useTranslators({
    token: user?.access_token,
    code,
  })
  const [coordinator, { mutate: mutateCoordinator }] = useCoordinators({
    token: user?.access_token,
    code,
  })
  const [moderators, { mutate: mutateModerator }] = useModerators({
    token: user?.access_token,
    code,
  })
  const assignModerator = async () => {
    if (!project?.id) {
      return
    }

    let { data, error } = await supabase.rpc('assign_moderator', {
      project_id: project.id,
      user_id: selectedTranslator.id,
    })

    if (error) console.error(error)
    else {
      setSelectedTranslator(false)

      mutateModerator()
      console.log(data)
    }
  }
  const removeModerator = async () => {
    if (!project?.id) {
      return
    }

    let { data, error } = await supabase.rpc('remove_moderator', {
      project_id: project.id,
      user_id: selectedTranslator.id,
    })

    if (error) console.error(error)
    else {
      setSelectedTranslator(false)
      mutateModerator()
      console.log(data)
    }
  }
  const assignTranslator = async () => {
    if (!project?.id) {
      return
    }

    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .post(`/api/projects/${code}/translators/`, {
        user_id: selectedUser,
        project_id: project?.id,
      })
      .then((result) => {
        const { data } = result
        mutate()
      })
      .catch((error) => console.log(error))
  }
  const moderatorsId = useMemo(() => {
    if (moderators) {
      return moderators.map((el) => el.users.id)
    }
  }, [moderators])

  return (
    <div>
      <div className="text-3xl mb-10">{project?.title}</div>
      <div className=" grid grid-cols-8 gap-2 ">
        {translators?.map((el, index) => {
          return (
            <div
              key={el.users.id}
              className="border-2 rounded-md border-cyan-400 w-fit p-2"
            >
              <User />
              <div>Переводчик {index + 1}</div>
              <div>{el.users.login}</div>
              <Switch
                checked={moderatorsId?.includes(el.users.id)}
                onChange={() => setSelectedTranslator(el.users)}
                className={`${
                  moderatorsId?.includes(el.users.id) ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full`}
              >
                <span className="sr-only">Enable notifications</span>
                <span
                  className={`${
                    moderatorsId?.includes(el.users.id)
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
              </Switch>
              <div className="ml-2 inline-block">Moderator</div>
            </div>
          )
        })}
        <svg
          className="cursor-pointer"
          fill="#000000"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 128 128"
          width="64px"
          height="64px"
          onClick={() => setOpenAssignTranslator(true)}
        >
          <path d="M 64 6.0507812 C 49.15 6.0507812 34.3 11.7 23 23 C 0.4 45.6 0.4 82.4 23 105 C 34.3 116.3 49.2 122 64 122 C 78.8 122 93.7 116.3 105 105 C 127.6 82.4 127.6 45.6 105 23 C 93.7 11.7 78.85 6.0507812 64 6.0507812 z M 64 12 C 77.3 12 90.600781 17.099219 100.80078 27.199219 C 121.00078 47.499219 121.00078 80.500781 100.80078 100.80078 C 80.500781 121.10078 47.500781 121.10078 27.300781 100.80078 C 7.0007813 80.500781 6.9992188 47.499219 27.199219 27.199219 C 37.399219 17.099219 50.7 12 64 12 z M 64 42 C 62.3 42 61 43.3 61 45 L 61 61 L 45 61 C 43.3 61 42 62.3 42 64 C 42 65.7 43.3 67 45 67 L 61 67 L 61 83 C 61 84.7 62.3 86 64 86 C 65.7 86 67 84.7 67 83 L 67 67 L 83 67 C 84.7 67 86 65.7 86 64 C 86 62.3 84.7 61 83 61 L 67 61 L 67 45 C 67 43.3 65.7 42 64 42 z" />
        </svg>
        <Modal
          open={openAssignTranslator}
          closeModal={() => {
            setOpenAssignTranslator(false)
            setSelectedUser(null)
          }}
        >
          <select
            defaultValue={users?.[0].id}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            {users
              ?.filter((el) => !translators?.map((el) => el.users.id).includes(el.id))
              .map((el) => {
                return (
                  <option value={el.id} key={el.id}>
                    {el.login}
                  </option>
                )
              })}
          </select>
          <button
            onClick={() => assignTranslator()}
            disabled={!selectedUser}
            className="btn-cyan mx-2"
          >
            Assign
          </button>
        </Modal>
        <Modal
          open={selectedTranslator ? Object.keys(selectedTranslator).length > 0 : false}
          closeModal={() => {
            setSelectedTranslator(false)
          }}
        >
          <div className="mb-2">
            {moderatorsId?.includes(selectedTranslator?.id)
              ? 'You are removing moderator'
              : 'You are assigning new moderator'}
          </div>

          <button
            onClick={() =>
              moderatorsId?.includes(selectedTranslator.id)
                ? removeModerator()
                : assignModerator()
            }
            disabled={!selectedTranslator}
            className="btn-cyan mx-2"
          >
            {moderatorsId?.includes(selectedTranslator?.id) ? 'Remove' : 'Assing'}
          </button>
        </Modal>
      </div>
    </div>
  )
}

export default ProjectEdit
