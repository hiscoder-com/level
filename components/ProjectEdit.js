import { useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import axios from 'axios'
import { Switch } from '@headlessui/react'

import Modal from 'components/Modal'
import TranslatorImage from 'components/TranslatorImage'

import { supabase } from 'utils/supabaseClient'
import { useCoordinators, useProject, useTranslators, useUsers } from 'utils/hooks'
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
  const [level, setLevel] = useState('user')

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

  useEffect(() => {
    const getLevel = async () => {
      const level = await supabase.rpc('authorize', {
        user_id: user.id,
        project_id: project.id,
      })
      setLevel(level.data)
    }
    if ((user?.id, project?.id)) {
      getLevel()
    }
  }, [user?.id, project?.id])

  const changeModerator = async (type) => {
    const { error } = await supabase.rpc(type, {
      project_id: project.id,
      user_id: selectedModerator.id,
    })
    if (error) console.error(error)
    else {
      setSelectedModerator(false)
      mutateTranslator()
    }
  }

  const roleActions = {
    translators: { mutate: mutateTranslator, reset: setSelectedTranslator },
    coordinators: { mutate: mutateCoordinator, reset: setSelectedCoordinator },
  }

  const remove = (userId, role) => {
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .delete(`/api/projects/${code}/${role}/${userId}`)
      .then(() => {
        roleActions[role].reset(false)
        roleActions[role].mutate()
      })
      .catch((error) => console.log(error))
  }

  const assign = (role) => {
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .post(`/api/projects/${code}/${role}/`, {
        user_id: selectedUser,
      })
      .then(() => {
        roleActions[role].mutate()
      })
      .catch((error) => console.log(error))
  }

  const moderatorIds = useMemo(() => {
    if (translators) {
      return translators.filter((el) => el.is_moderator).map((el) => el.users.id)
    }
  }, [translators])

  return (
    <div className="divide-y-2 divide-gray-400">
      <div className="pb-5">
        <div className="pb-5 inline-block ml-2">{t('NameProject')}</div>
        <div className="pb-5 inline-block ml-2">{project?.title}</div>
        <div className="w-1/2 flex justify-between">
          <div className="ml-2">{t('Coordinators')}</div>
          {'admin' === level && (
            <button
              onClick={() => setOpenModalAssignCoordinator(true)}
              className="btn-cyan m-2"
            >
              {t('project-edit:AddCoordinator')}
            </button>
          )}
        </div>
        <CoordinatorsList
          coordinators={coordinators}
          setSelectedCoordinator={setSelectedCoordinator}
          canDelete={'admin' === level}
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
          setSelectedModerator={setSelectedModerator}
          setSelectedTranslator={setSelectedTranslator}
        />
        <div>
          <Modal
            isOpen={openModalAssignTranslator}
            closeHandle={() => {
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
              onClick={() => {
                assign('translators')
                setSelectedUser(null)
              }}
              disabled={!selectedUser}
              className="btn-cyan mx-2"
            >
              {t('Assign')}
            </button>
            <div className="mt-4">
              <button
                className="btn-cyan w-24"
                onClick={() => {
                  setOpenModalAssignTranslator(false)
                  setSelectedUser(null)
                }}
              >
                {t('common:Close')}
              </button>
            </div>
          </Modal>
          <Modal
            isOpen={openModalAssignCoordinator}
            closeHandle={() => {
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
                ?.filter((el) => !coordinators?.map((el) => el.users.id).includes(el.id))
                .map((el) => {
                  return (
                    <option value={el.id} key={el.id}>
                      {el.login}
                    </option>
                  )
                })}
            </select>
            <button
              onClick={() => {
                assign('coordinators')
                setSelectedUser(null)
              }}
              disabled={!selectedUser}
              className="btn-cyan mx-2"
            >
              {t('Assign')}
            </button>
            <div className="mt-4">
              <button
                className="btn-cyan w-24"
                onClick={() => {
                  setOpenModalAssignCoordinator(false)
                  setSelectedUser(null)
                }}
              >
                {t('common:Close')}
              </button>
            </div>
          </Modal>
          <Modal
            isOpen={selectedModerator ? Object.keys(selectedModerator).length > 0 : false}
            closeHandle={() => {
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
              {moderatorIds?.includes(selectedModerator?.id) ? t('Remove') : t('Assign')}
            </button>
            <div className="mt-4">
              <button
                className="btn-cyan w-24"
                onClick={() => {
                  setSelectedModerator(false)
                }}
              >
                {t('common:Close')}
              </button>
            </div>
          </Modal>
          <Modal
            isOpen={
              selectedTranslator ? Object.keys(selectedTranslator).length > 0 : false
            }
            closeHandle={() => {
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
            <div className="mt-4">
              <button
                className="btn-cyan w-24"
                onClick={() => {
                  setSelectedTranslator(false)
                }}
              >
                {t('common:Close')}
              </button>
            </div>
          </Modal>
          <Modal
            isOpen={
              selectedCoordinator ? Object.keys(selectedCoordinator).length > 0 : false
            }
            closeHandle={() => {
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
            <div className="mt-4">
              <button
                className="btn-cyan w-24"
                onClick={() => {
                  setSelectedCoordinator(false)
                }}
              >
                {t('common:Close')}
              </button>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  )
}

export default ProjectEdit

function TranslatorsList({ translators, setSelectedModerator, setSelectedTranslator }) {
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
                    checked={el.is_moderator}
                    onChange={() => setSelectedModerator(el.users)}
                    className={`${
                      el.is_moderator ? 'bg-blue-600' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 items-center rounded-full`}
                  >
                    <span
                      className={`${
                        el.is_moderator ? 'translate-x-6' : 'translate-x-1'
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

function CoordinatorsList({ coordinators, setSelectedCoordinator, canDelete = false }) {
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
                  {canDelete && (
                    <button
                      onClick={() => setSelectedCoordinator(el.users)}
                      className="btn-red"
                    >
                      {t('Remove')}
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
