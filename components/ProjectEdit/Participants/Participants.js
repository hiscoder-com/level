import { useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import axios from 'axios'

import Modal from 'components/Modal'
import TranslatorsList from './TranslatorsList'
import CoordinatorsList from './CoordinatorsList'
import RemoveParticipant from './RemoveParticipant'
import AssignParticipant from './AssignPartisipant'

import { supabase } from 'utils/supabaseClient'
import { useCoordinators, useProject, useTranslators } from 'utils/hooks'

function Parcticipants({ user, users, highLevelAccess, level }) {
  const { t } = useTranslation(['common', 'project-edit', 'projects'])
  const {
    query: { code },
  } = useRouter()
  const [translators, { mutate: mutateTranslator }] = useTranslators({
    token: user?.access_token,
    code,
  })
  const [coordinators, { mutate: mutateCoordinator }] = useCoordinators({
    token: user?.access_token,
    code,
  })
  const [project] = useProject({ token: user?.access_token, code })

  const [listOfTranslators, setListOfTranslators] = useState([])
  const [listOfCoordinators, setListOfCoordinators] = useState([])
  const [openModalAssignTranslator, setOpenModalAssignTranslator] = useState(false)
  const [openModalAssignCoordinator, setOpenModalAssignCoordinator] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedModerator, setSelectedModerator] = useState(null)
  const [selectedTranslator, setSelectedTranslator] = useState(null)
  const [selectedCoordinator, setSelectedCoordinator] = useState(null)

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
  useEffect(() => {
    const listOf = users?.filter(
      (user) => !translators?.map((translator) => translator.users.id).includes(user.id)
    )
    setListOfTranslators(listOf)
    setSelectedUser(listOf?.[0]?.id)
  }, [translators, users])

  useEffect(() => {
    const listOf = users?.filter(
      (user) =>
        !coordinators?.map((coordinator) => coordinator.users.id).includes(user.id)
    )
    setListOfCoordinators(listOf)
    setSelectedUser(listOf?.[0]?.id)
  }, [coordinators, users])

  const roleActions = {
    translators: { mutate: mutateTranslator, reset: setSelectedTranslator },
    coordinators: { mutate: mutateCoordinator, reset: setSelectedCoordinator },
  }
  const assign = (role) => {
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .post(`/api/projects/${code}/${role}/`, {
        user_id: selectedUser,
      })
      .then(() => roleActions[role].mutate())
      .catch(console.log)
  }

  const moderatorIds = useMemo(() => {
    if (translators) {
      return translators
        .filter((translator) => translator.is_moderator)
        .map((user) => user.users.id)
    }
  }, [translators])
  const remove = (userId, role) => {
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .delete(`/api/projects/${code}/${role}/${userId}`)
      .then(() => {
        roleActions[role].reset(false)
        roleActions[role].mutate()
      })
      .catch(console.log)
  }
  return (
    <>
      {highLevelAccess && (
        <div className="card text-darkBlue">
          <h3 className="h3 mb-5 font-bold">{t('Participants')}</h3>
          <div className="divide-y-2 divide-black">
            <div className="flex flex-col gap-7 pb-5">
              <div className="flex justify-between items-center gap-2 md:text-xl font-bold">
                <div>{t('Coordinators')}</div>
                {'admin' === level && (
                  <button
                    onClick={() => {
                      setOpenModalAssignCoordinator(true)
                      setSelectedUser(listOfCoordinators?.[0]?.id)
                    }}
                    className="btn-link truncate"
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

            <div className="flex flex-col gap-7 pt-5">
              <div className="flex justify-between items-center md:text-xl font-bold">
                <div>{t('projects:Translators')}</div>
                <button
                  onClick={() => {
                    setOpenModalAssignTranslator(true)
                    setSelectedUser(listOfTranslators?.[0]?.id)
                  }}
                  className="btn-link"
                >
                  {t('projects:AddTranslator')}
                </button>
              </div>
              <TranslatorsList
                translators={translators}
                setSelectedModerator={setSelectedModerator}
                setSelectedTranslator={setSelectedTranslator}
              />

              <Modal
                isOpen={
                  selectedModerator ? Object.keys(selectedModerator).length > 0 : false
                }
                closeHandle={() => setSelectedModerator(false)}
              >
                <div className="text-center">
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
                  <div className="mt-4">
                    <button
                      className="btn-cyan w-24"
                      onClick={() => setSelectedModerator(false)}
                    >
                      {t('Close')}
                    </button>
                  </div>
                </div>
              </Modal>
              <div>
                {[
                  {
                    openModalAssign: openModalAssignCoordinator,
                    setOpenModalAssign: setOpenModalAssignCoordinator,
                    listOfAssigned: listOfCoordinators,
                    role: 'coordinators',
                  },
                  {
                    openModalAssign: openModalAssignTranslator,
                    setOpenModalAssign: setOpenModalAssignTranslator,
                    listOfAssigned: listOfTranslators,
                    role: 'translators',
                  },
                ].map((user) => (
                  <AssignParticipant
                    key={user.role}
                    openModalAssign={user.openModalAssign}
                    setOpenModalAssign={user.setOpenModalAssign}
                    setSelectedUser={setSelectedUser}
                    selectedUser={selectedUser}
                    listOfAssigned={user.listOfAssigned}
                    assign={assign}
                    role={user.role}
                  />
                ))}
                {[
                  {
                    selected: selectedTranslator,
                    setSelected: setSelectedTranslator,
                    label: 'project-edit:RemovingTranslator',
                    role: 'translators',
                  },
                  {
                    selected: selectedCoordinator,
                    setSelected: setSelectedCoordinator,
                    label: 'project-edit:RemovingCoordinator',
                    role: 'coordinators',
                  },
                ].map((user) => (
                  <RemoveParticipant
                    key={user.role}
                    selected={user.selected}
                    setSelected={user.setSelected}
                    remove={remove}
                    label={user.label}
                    role={user.role}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
export default Parcticipants
