import { useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import axios from 'axios'

import { Switch } from '@headlessui/react'

import Modal from './Modal'
import TranslatorImage from './TranslatorImage'

import { supabase } from 'utils/supabaseClient'
import {
  useCoordinators,
  useModerators,
  useProject,
  useTranslators,
  useUsers,
} from 'utils/hooks'
import { useCurrentUser } from 'lib/UserContext'

function ProjectEdit() {
  const { t } = useTranslation(['common', 'project-edit'])
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

    const { error } = await supabase.rpc(type, {
      project_id: project.id,
      user_id: selectedModerator.id,
    })
    if (error) console.error(error)
    else {
      setSelectedModerator(false)
      mutateModerator()
    }
  }
  const roleActions = {
    translators: { mutate: mutateTranslator, reset: setSelectedTranslator },
    coordinators: { mutate: mutateCoordinator, reset: setSelectedCoordinator },
  }

  const remove = async (id, role) => {
    if (!project?.id) {
      return
    }
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .delete(`/api/projects/${code}/${role}/${id}`, {
        data: { project_id: project.id },
      })
      .then(() => {
        roleActions[role].reset(false)
        roleActions[role].mutate()
      })
      .catch((error) => console.log(error))
  }

  const assign = async (role) => {
    if (!project?.id) {
      return
    }
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .post(`/api/projects/${code}/${role}/`, {
        user_id: selectedUser,
        project_id: project?.id,
      })
      .then(() => {
        roleActions[role].mutate()
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
      <div className="divide-y-2 divide-gray-400">
        <div className="pb-5">
          <div className="pb-5 inline-block ml-2">{t('NameProject')}</div>
          <div className="pb-5 inline-block ml-2">{project?.title}</div>
          <div className="w-1/2 flex justify-between">
            <div className="ml-2">{t('Coordinators')}</div>
            <button
              onClick={() => setOpenModalAssignCoordinator(true)}
              className="btn-cyan m-2"
            >
              {t('project-edit:AddCoordinator')}
            </button>
          </div>
          <CoordinatorsList
            coordinators={coordinators}
            setSelectedCoordinator={setSelectedCoordinator}
          />
        </div>
        <div className="pt-5 pb-5">
          <div className="flex justify-between">
            <div className="ml-2">{t('Translators')}</div>
            <button
              onClick={() => setOpenModalAssignTranslator(true)}
              className="btn-cyan m-2"
            >
              {t('project-edit:AddTranslator')}
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
                onClick={() => assign('translators')}
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
                onClick={() => assign('coordinators')}
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
                  ? t('project-edit:RemovingModerator')
                  : t('project-edit:AssigningModerator')}
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
              <div className="mb-2">{t('project-edit:RemovingTranslator')}</div>

              <button
                onClick={() => remove(selectedTranslator.id, 'translators')}
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
              <div className="mb-2">{t('project-edit:RemovingCoordinator')}</div>

              <button
                onClick={() => remove(selectedCoordinator.id, 'coordinators')}
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
  const { t } = useTranslation(['common'])
  return (
    <div className="overflow-x-auto relative px-4">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="py-3 px-6"></th>
            <th scope="col" className="py-3 px-6">
              {t('Login')}
            </th>
            <th scope="col" className="py-3 px-6 hidden sm:block">
              {t('Email')}
            </th>
            <th scope="col" className="py-3 px-6">
              {t('Moderator')}
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
                <td className="py-4 px-6 hidden sm:block">{el.users.email}</td>
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
                    {t('Remove')}
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
  const { t } = useTranslation(['common'])
  return (
    <div className="overflow-x-auto relative px-4">
      <table className="w-1/2 text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="py-3 px-6"></th>
            <th scope="col" className="py-3 px-6">
              {t('Login')}
            </th>
            <th scope="col" className="py-3 px-6 hidden sm:block">
              {t('Email')}
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
                <td className="py-4 px-6 hidden sm:block">{el.users.email}</td>

                <td className="py-4 px-6">
                  <button
                    onClick={() => setSelectedCoordinator(el.users)}
                    className="btn-red"
                  >
                    {t('Remove')}
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
