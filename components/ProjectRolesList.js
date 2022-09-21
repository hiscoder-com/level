import { useState } from 'react'

import axios from 'axios'
import { useTranslation } from 'next-i18next'

function ProjectRolesList({
  moderators,
  user,
  code,
  mutate,
  mutateModerator,
  project,
  type,
  role,
  coordinator,
  translators,
  permissions,
}) {
  const [userId, setUserId] = useState('')
  const [showRadio, setShowRadio] = useState(false)
  const [moderator, setModerator] = useState(null)
  const [showSelect, setShowSelect] = useState(false)
  const { t } = useTranslation(['projects'])

  const handleSet = async () => {
    if (!project?.id) {
      return
    }

    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .post(`/api/projects/${code}/${type}/`, {
        user_id: userId,
        project_id: project?.id,
      })
      .then((result) => {
        const { data } = result
        mutate()
        setShowSelect(false)
        //TODO обработать статус и дата если статус - 201, тогда сделать редирект route.push(headers.location)
      })
      .catch((error) => console.log(error))
  }

  const handleUpdate = async (id) => {
    if (!project?.id) {
      return
    }
    if (type === 'coordinators') {
      axios.defaults.headers.common['token'] = user?.access_token
      axios
        .put(`/api/projects/${code}/${type}/${userId}`, {
          project_id: project?.id,
          prev_id: coordinator && coordinator.users?.id,
        })
        .then((result) => {
          mutate()
          setShowSelect(false)
        })
        .catch((error) => console.log(error))
      return
    }
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .delete(`/api/projects/${code}/${type}/${id}`, {
        data: { projectId: project?.id },
      })
      .then((result) => {
        mutate()
      })
      .catch((error) => console.log(error))
  }
  const handleSetModerator = async () => {
    if (!project?.id) {
      return
    }

    if (moderators && Object.keys(moderators).length === 0) {
      axios.defaults.headers.common['token'] = user?.access_token
      axios
        .post(`/api/projects/${code}/moderators/`, {
          user_id: moderator,
          project_id: project?.id,
        })
        .then((result) => {
          mutateModerator()
          setShowRadio(false)
        })
        .catch((error) => console.log(error))
    } else {
      axios.defaults.headers.common['token'] = user?.access_token
      axios
        .put(`/api/projects/${code}/moderators/${moderator}`, {
          project_id: project?.id,
          prev_id: moderators.users?.id,
        })
        .then((result) => {
          mutateModerator()
          setShowRadio(false)
        })
        .catch((error) => console.log(error))
    }
  }

  return (
    <div>
      <div className="capitalize">{`${type}`}:</div>
      <div className="flex flex-col my-5">
        {coordinator && Object.keys(coordinator).length > 0 && coordinator.users.email}
        {translators &&
          type === 'translators' &&
          translators.map((el, key) => {
            return (
              <div className="flex" key={key}>
                <div
                  className={`mx-5  ${
                    moderators?.users?.id === el.users.id && 'text-gray-500'
                  }`}
                >
                  {el.users.email}
                </div>
                {type !== 'coordinators' &&
                  ((permissions?.data &&
                    permissions.data
                      .map((el) => el.permission)
                      .includes('translator.set')) ||
                    role === 'admin') && (
                    <>
                      {moderators?.users?.id === el.users.id ? (
                        'Мoderator'
                      ) : !showRadio ? (
                        <button
                          onClick={() =>
                            type !== 'coordinators'
                              ? handleUpdate(el.users.id)
                              : setShowSelect(true)
                          }
                          className="btn-filled w-28 my-1"
                          disabled={showSelect || moderators?.users?.id === el.users.id}
                        >
                          {t('Delete')}
                        </button>
                      ) : (
                        <div className="form-check">
                          <input
                            onChange={(e) => setModerator(e.target.value)}
                            disabled={moderators?.users?.id === el.users.id}
                            className={`form-check-input appearance-none rounded-full h-4 w-4 border border-gray-300 bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 my-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 ${
                              moderators?.users?.id !== el.users.id && 'cursor-pointer'
                            }`}
                            type="radio"
                            name="flexRadioDefault"
                            id="flexRadioDefault10"
                            value={el.users.id}
                          />
                        </div>
                      )}
                    </>
                  )}
              </div>
            )
          })}

        {((permissions?.data &&
          permissions.data.map((el) => el.permission).includes('translator.set')) ||
          role === 'admin') && (
          <>
            {showSelect && (
              <div className="inline-block">
                <select
                  onChange={(event) => {
                    setUserId(event.target.value)
                  }}
                  value={userId}
                  className="input max-w-sm"
                >
                  {translators.map((el) => {
                    return (
                      <option key={el.users.id} value={el.users.id}>
                        {el.users.email}
                      </option>
                    )
                  })}
                </select>
                <button
                  onClick={() => {
                    if (coordinator && type === 'coordinators') {
                      handleUpdate(coordinator.users.id)
                      return
                    }
                    handleSet()
                  }}
                  className="inline-block ml-2 btn-cyan w-32 my-1"
                >
                  {`${t('AppointAn')} ${
                    type !== 'coordinators' ? `${t('Translator')}` : `${t('Coordinator')}`
                  }`}
                </button>
                <button
                  onClick={() => setShowSelect(false)}
                  className="inline-block mx-2 btn-cyan w-32 my-1"
                >
                  {t('Cancel')}
                </button>
              </div>
            )}

            <button
              onClick={() => setShowSelect(true)}
              className="btn-cyan w-32 my-1"
              disabled={showSelect || showRadio}
            >
              {type !== 'coordinators'
                ? `${t('AddTranslator')}`
                : `${
                    coordinator && Object.values(coordinator).length > 0
                      ? `${t('Change')}`
                      : `${t('Add')}`
                  } ${t('Сoordinator')}`}
            </button>

            {((permissions?.data &&
              permissions.data.map((el) => el.permission).includes('moderator.set')) ||
              role === 'admin') &&
              type === 'translators' && (
                <button
                  onClick={() => setShowRadio((prev) => !prev)}
                  className="btn-cyan w-28 my-1"
                  disabled={showSelect || showRadio}
                >
                  {t('ChooseAModerator')}
                </button>
              )}
            {showRadio && (
              <>
                <button
                  onClick={() => setShowRadio((prev) => !prev)}
                  className="btn-cyan w-32 my-1"
                >
                  {t('Cancel')}
                </button>
                <button
                  disabled={!moderator}
                  onClick={handleSetModerator}
                  className="btn-cyan w-32 my-1"
                >
                  {t('AppointAModerator')}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ProjectRolesList
