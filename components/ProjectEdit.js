import { useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import axios from 'axios'

import { Switch } from '@headlessui/react'

import Modal from './Modal'
import { supabase } from 'utils/supabaseClient'
import {
  useCoordinators,
  useModerators,
  useProject,
  useTranslators,
  useUsers,
} from 'utils/hooks'
import { useCurrentUser } from 'lib/UserContext'

import { useTranslation } from 'next-i18next'
import TranslatorImage from './TranslatorImage'

function ProjectEdit() {
  const { t } = useTranslation('common')

  const {
    query: { code },
  } = useRouter()
  const { user } = useCurrentUser()
  const [users] = useUsers(user?.access_token)
  const [openModalAssignTranslator, setOpenModalAssignTranslator] = useState(false)
  const [openModalAssignCoordinator, setOpenModalAssignCoordinator] = useState(false)

  const [selectedModerator, setSelectedModerator] = useState(null)
  const [selectedTranslator, setSelectedTranslator] = useState(null)
  const [selectedCoordinator, setSelectedCoordinator] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)

  const [project] = useProject({ token: user?.access_token, code })
  const [translators, { mutate: mutateTranslator }] = useTranslators({
    token: user?.access_token,
    code,
  })
  const [coordinators, { mutate: mutateCoordinator }] = useCoordinators({
    token: user?.access_token,
    code,
  })
  const [moderators, { mutate: mutateModerator }] = useModerators({
    token: user?.access_token,
    code,
  })
  const changeModerator = async (type) => {
    if (!project?.id) {
      return
    }

    let { data, error } = await supabase.rpc(type, {
      project_id: project.id,
      user_id: selectedModerator.id,
    })

    if (error) console.error(error)
    else {
      setSelectedModerator(false)
      mutateModerator()
      console.log(data)
    }
  }

  const removeTranslator = async (id) => {
    if (!project?.id) {
      return
    }
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .delete(`/api/projects/${code}/translators/${id}`, {
        data: { project_id: project.id },
      })
      .then((result) => {
        const { data } = result
        setSelectedTranslator(false)
        mutateTranslator()
      })
      .catch((error) => console.log(error))
  }
  const removeCoordinator = async (id) => {
    if (!project?.id) {
      return
    }
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .delete(`/api/projects/${code}/coordinators/${id}`, {
        data: { project_id: project.id },
      })
      .then((result) => {
        const { data } = result
        setSelectedTranslator(false)
        mutateCoordinator()
      })
      .catch((error) => console.log(error))
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
        mutateTranslator()
      })
      .catch((error) => console.log(error))
  }
  const assignCoordinator = async () => {
    if (!project?.id) {
      return
    }

    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .post(`/api/projects/${code}/coordinators/`, {
        user_id: selectedUser,
        project_id: project?.id,
      })
      .then((result) => {
        const { data } = result
        mutateCoordinator()
      })
      .catch((error) => console.log(error))
  }
  const moderatorIds = useMemo(() => {
    if (moderators) {
      return moderators.map((el) => el.users.id)
    }
  }, [moderators])

  return (
    <div>
      <div className="divide-y-2  divide-gray-400">
        <div className="pb-5">
          <div className="text-2xl pb-5">{project?.title}</div>
          <div className="w-1/2 flex justify-between">
            <div className="ml-2">Координаторы</div>
            <button
              onClick={() => setOpenModalAssignCoordinator(true)}
              className="btn-cyan mb-2"
            >
              Добавить координатора
            </button>
          </div>
          <CoordinatorsList
            coordinators={coordinators}
            setSelectedCoordinator={setSelectedCoordinator}
          />
        </div>
        <div className="pt-5">
          <div className="flex justify-between">
            <div className="ml-2">Translators</div>
            <button
              onClick={() => setOpenModalAssignTranslator(true)}
              className="btn-cyan mb-2"
            >
              Добавить переводчика
            </button>
          </div>
          <TranslatorsList
            translators={translators}
            moderatorIds={moderatorIds}
            setSelectedModerator={setSelectedModerator}
            setSelectedTranslator={setSelectedTranslator}
          />
          <div>
            <Modal
              open={openModalAssignTranslator}
              closeModal={() => {
                setOpenModalAssignTranslator(false)
                setSelectedUser(null)
              }}
            >
              <select
                className="input m-2"
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
                {t('Assign')}
              </button>
            </Modal>
            <Modal
              open={openModalAssignCoordinator}
              closeModal={() => {
                setOpenModalAssignCoordinator(false)
                setSelectedUser(null)
              }}
            >
              <select
                className="input m-2"
                defaultValue={users?.[0].id}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                {users
                  ?.filter(
                    (el) => !coordinators?.map((el) => el.users.id).includes(el.id)
                  )
                  .map((el) => {
                    return (
                      <option value={el.id} key={el.id}>
                        {el.login}
                      </option>
                    )
                  })}
              </select>
              <button
                onClick={() => assignCoordinator()}
                disabled={!selectedUser}
                className="btn-cyan mx-2"
              >
                {t('Assign')}
              </button>
            </Modal>
            <Modal
              open={selectedModerator ? Object.keys(selectedModerator).length > 0 : false}
              closeModal={() => {
                setSelectedModerator(false)
              }}
            >
              <div className="mb-2">
                {moderatorIds?.includes(selectedModerator?.id)
                  ? t('RemovingModerator')
                  : t('AssigningModerator')}
              </div>

              <button
                onClick={() =>
                  changeModerator(
                    moderatorIds?.includes(selectedModerator.id)
                      ? 'remove_moderator'
                      : 'assign_moderator'
                  )
                }
                disabled={!selectedModerator}
                className="btn-cyan mx-2"
              >
                {moderatorIds?.includes(selectedModerator?.id)
                  ? t('Remove')
                  : t('Assign')}
              </button>
            </Modal>
            <Modal
              open={
                selectedTranslator ? Object.keys(selectedTranslator).length > 0 : false
              }
              closeModal={() => {
                setSelectedTranslator(false)
              }}
            >
              <div className="mb-2">{t('RemovingTranslator')}</div>

              <button
                onClick={() => removeTranslator(selectedTranslator.id)}
                disabled={!selectedTranslator}
                className="btn-cyan mx-2"
              >
                {t('Remove')}
              </button>
            </Modal>
            <Modal
              open={
                selectedCoordinator ? Object.keys(selectedCoordinator).length > 0 : false
              }
              closeModal={() => {
                setSelectedCoordinator(false)
              }}
            >
              <div className="mb-2">{t('RemovingTranslator')}</div>

              <button
                onClick={() => removeCoordinator(selectedCoordinator.id)}
                disabled={!selectedCoordinator}
                className="btn-cyan mx-2"
              >
                {t('Remove')}
              </button>
            </Modal>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectEdit

function TranslatorsList({
  translators,
  moderatorIds,
  setSelectedModerator,
  setSelectedTranslator,
}) {
  return (
    <div className="overflow-x-auto relative">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="py-3 px-6"></th>
            <th scope="col" className="py-3 px-6">
              Login
            </th>
            <th scope="col" className="py-3 px-6">
              Email
            </th>
            <th scope="col" className="py-3 px-6">
              Moderator
            </th>
            <th scope="col" className="py-3 px-6"></th>
          </tr>
        </thead>
        <tbody>
          {translators?.map((el) => {
            return (
              <tr
                key={el.users.id}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
              >
                <th
                  scope="row"
                  className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  <div className="w-8">
                    <TranslatorImage item={el} />
                  </div>
                </th>
                <td className="py-4 px-6">{el.users.login}</td>
                <td className="py-4 px-6">{el.users.email}</td>
                <td className="py-4 px-6">
                  <Switch
                    checked={moderatorIds?.includes(el.users.id)}
                    onChange={() => setSelectedModerator(el.users)}
                    className={`${
                      moderatorIds?.includes(el.users.id) ? 'bg-blue-600' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 items-center rounded-full`}
                  >
                    <span className="sr-only">Enable notifications</span>
                    <span
                      className={`${
                        moderatorIds?.includes(el.users.id)
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                    />
                  </Switch>
                </td>
                <td className="py-4 px-6">
                  <button
                    onClick={() => setSelectedTranslator(el.users)}
                    className="btn-red"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function CoordinatorsList({ coordinators, setSelectedCoordinator }) {
  return (
    <div className="overflow-x-auto relative">
      <table className="w-1/2 text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="py-3 px-6"></th>
            <th scope="col" className="py-3 px-6">
              Login
            </th>
            <th scope="col" className="py-3 px-6">
              Email
            </th>

            <th scope="col" className="py-3 px-6"></th>
          </tr>
        </thead>
        <tbody>
          {coordinators?.map((el) => {
            return (
              <tr
                key={el.users.id}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
              >
                <th
                  scope="row"
                  className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  <div className="w-8">
                    <TranslatorImage item={el} />
                  </div>
                </th>
                <td className="py-4 px-6">{el.users.login}</td>
                <td className="py-4 px-6">{el.users.email}</td>

                <td className="py-4 px-6">
                  <button
                    onClick={() => setSelectedCoordinator(el.users)}
                    className="btn-red"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
