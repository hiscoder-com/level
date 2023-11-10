import { useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import axios from 'axios'

import Modal from 'components/Modal'
import TranslatorsList from './TranslatorsList'
import CoordinatorsList from './CoordinatorsList'
import RemoveParticipant from './RemoveParticipant'
import AssignParticipant from './AssignPartiсipant'

import useSupabaseClient from 'utils/supabaseClient'
import { useCoordinators, useProject, useTranslators } from 'utils/hooks'

function Parcticipants({ users, access: { isCoordinatorAccess, isAdminAccess } }) {
  const supabase = useSupabaseClient()

  const { t } = useTranslation(['common', 'project-edit', 'projects'])
  const {
    query: { code },
  } = useRouter()
  const [translators, { mutate: mutateTranslator }] = useTranslators({
    code,
  })
  const [coordinators, { mutate: mutateCoordinator }] = useCoordinators({
    code,
  })
  const [project] = useProject({ code })

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
    if (error) {
      console.error(error)
    } else {
      setSelectedModerator(false)
      mutateTranslator()
    }
  }
  useEffect(() => {
    if (translators) {
      const translatorIds = translators?.map((translator) => translator.users.id)
      const listOf = users?.filter((user) => !translatorIds.includes(user.id))
      setListOfTranslators(listOf)
      setSelectedUser(listOf?.[0]?.id)
    }
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
      <div className="hidden sm:block divide-y divide-th-text-primary">
        <div className="flex flex-col gap-7 pb-5">
          <div className="flex justify-between items-center gap-2">
            <div className="font-bold">{t('projects:Coordinators')}</div>
            {isAdminAccess && (
              <button
                onClick={() => {
                  setOpenModalAssignCoordinator(true)
                  setSelectedUser(listOfCoordinators?.[0]?.id)
                }}
                className="btn-primary truncate"
              >
                {t('project-edit:AddCoordinator')}
              </button>
            )}
          </div>
          <CoordinatorsList
            coordinators={coordinators}
            setSelectedCoordinator={setSelectedCoordinator}
            access={isAdminAccess}
          />
        </div>
        <div className="flex flex-col gap-7 pt-5">
          <div className="flex justify-between items-center">
            <div className="font-bold">{t('projects:Translators')}</div>
            <button
              onClick={() => {
                setOpenModalAssignTranslator(true)
                setSelectedUser(listOfTranslators?.[0]?.id)
              }}
              className="btn-primary"
            >
              {t('project-edit:AddTranslator')}
            </button>
          </div>
          <TranslatorsList
            translators={translators}
            setSelectedModerator={setSelectedModerator}
            setSelectedTranslator={setSelectedTranslator}
            access={isCoordinatorAccess}
          />

          <Modal
            isOpen={selectedModerator ? Object.keys(selectedModerator).length > 0 : false}
            closeHandle={() => setSelectedModerator(false)}
          >
            <div className="flex flex-col justify-center gap-7 min-h-[15vh]">
              <div className="text-base md:text-xl text-center">
                {moderatorIds?.includes(selectedModerator?.id)
                  ? t('project-edit:RemovingModerator')
                  : t('project-edit:AssigningModerator')}
              </div>

              <div className="flex justify-center self-center gap-7 w-2/3 text-center">
                <button
                  className="btn-secondary flex-1"
                  onClick={() =>
                    changeModerator(
                      moderatorIds?.includes(selectedModerator.id)
                        ? 'remove_moderator'
                        : 'assign_moderator'
                    )
                  }
                  disabled={!selectedModerator}
                >
                  {moderatorIds?.includes(selectedModerator?.id)
                    ? t('Remove')
                    : t('Assign')}
                </button>

                <button
                  className="btn-secondary flex-1"
                  onClick={() => setSelectedModerator(false)}
                >
                  {t('Close')}
                </button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
      <div className="block sm:hidden divide-y divide-th-text-primary">
        <div className="flex flex-col gap-3 pb-5">
          <div className="flex justify-between items-center gap-2">
            <div>{t('Coordinator', { count: 0 })}</div>
          </div>
          <CoordinatorsList
            coordinators={coordinators}
            setSelectedCoordinator={setSelectedCoordinator}
            access={isAdminAccess}
          />
          {isAdminAccess && (
            <button
              onClick={() => {
                setOpenModalAssignCoordinator(true)
                setSelectedUser(listOfCoordinators?.[0]?.id)
              }}
              className="btn-primary truncate"
            >
              {t('project-edit:AddCoordinator')}
            </button>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:gap-7 pt-5">
          <div className="flex justify-between items-center">
            <div>{t('projects:Translators')}</div>
          </div>
          <TranslatorsList
            translators={translators}
            setSelectedModerator={setSelectedModerator}
            setSelectedTranslator={setSelectedTranslator}
            access={isCoordinatorAccess}
          />
          <button
            onClick={() => {
              setOpenModalAssignTranslator(true)
              setSelectedUser(listOfTranslators?.[0]?.id)
            }}
            className="btn-primary"
          >
            {t('project-edit:AddTranslator')}
          </button>

          <div>
            {[
              {
                openModalAssign: openModalAssignCoordinator,
                setOpenModalAssign: setOpenModalAssignCoordinator,
                listOfAssigned: listOfCoordinators,
                label: 'project-edit:AddingCoordinator',
                role: 'coordinators',
              },
              {
                openModalAssign: openModalAssignTranslator,
                setOpenModalAssign: setOpenModalAssignTranslator,
                listOfAssigned: listOfTranslators,
                label: 'project-edit:AddingTranslator',
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
                label={user.label}
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
    </>
  )
}
export default Parcticipants
