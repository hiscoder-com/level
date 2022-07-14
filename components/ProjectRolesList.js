import React, { useMemo, useState } from 'react'
import axios from 'axios'

function ProjectRolesEdit({
  moderators,
  session,
  code,
  mutate,
  mutateModerator,
  project,
  users,
  type,
  role,
  roles,
  permissions,
}) {
  const [userId, setUserId] = useState(null)
  const [showRadio, setShowRadio] = useState(false)
  const [moderator, setModerator] = useState(null)
  const [showSelect, setShowSelect] = useState(false)

  const handleSet = async () => {
    if (!project?.id) {
      return
    }

    axios.defaults.headers.common['token'] = session?.access_token
    axios
      .post(`/api/${project?.languages?.code}/projects/${code}/${type}/`, {
        user_id: userId,
        project_id: project?.id,
      })
      .then((result) => {
        const { data } = result
        mutate()
        setShowSelect(false)
        //TODO обработать статус и дата если статус - 201, тогда сделать редирект route.push(headers.location)
      })
      .catch((error) => console.log(error, 'from axios'))
  }
  const handleUpdate = async (id) => {
    if (!project?.id) {
      return
    }
    if (type === 'coordinators') {
      axios.defaults.headers.common['token'] = session?.access_token
      axios
        .put(`/api/${project?.languages?.code}/projects/${code}/${type}/${userId}`, {
          project_id: project?.id,
          prev_id: roles?.data[0]?.users?.id,
        })
        .then((result) => {
          const { data } = result
          mutate()
          setShowSelect(false)
          //TODO обработать статус и дата если статус - 201, тогда сделать редирект route.push(headers.location)
        })
        .catch((error) => console.log(error, 'from axios'))
      return
    }
    axios.defaults.headers.common['token'] = session?.access_token
    axios
      .delete(`/api/${project?.languages?.code}/projects/${code}/${type}/${id}`, {
        data: { projectId: project?.id },
      })
      .then((result) => {
        const { data, status } = result
        mutate()
        //TODO обработать статус и дата если статус - 201, тогда сделать редирект route.push(headers.location)
      })
      .catch((error) => console.log(error, 'from axios'))
  }

  const handleSetModerator = async () => {
    if (!project?.id) {
      return
    }
    if (!moderators) {
      axios.defaults.headers.common['token'] = session?.access_token
      axios
        .post(`/api/${project?.languages?.code}/projects/${code}/moderators/`, {
          user_id: moderator,
          project_id: project?.id,
        })
        .then((result) => {
          const { data } = result
          mutateModerator()
          setShowRadio(false)
          //TODO обработать статус и дата если статус - 201, тогда сделать редирект route.push(headers.location)
        })
        .catch((error) => console.log(error, 'from axios'))
    } else {
      axios.defaults.headers.common['token'] = session?.access_token
      axios
        .put(
          `/api/${project?.languages?.code}/projects/${code}/moderators/${moderator}`,
          {
            project_id: project?.id,
            prev_id: moderators?.id,
          }
        )
        .then((result) => {
          const { data } = result
          mutateModerator()
          setShowRadio(false)
          //TODO обработать статус и дата если статус - 201, тогда сделать редирект route.push(headers.location)
        })
        .catch((error) => console.log(error, 'from axios'))
    }
  }
  const availableTranslators = useMemo(
    () =>
      roles &&
      users &&
      Object.values(users)
        .filter((el) => el.agreement && el.confession)
        .filter(
          (user) =>
            !roles?.data
              .map((el) => {
                return el.users.id
              })
              .includes(user.id)
        ),
    [roles, users]
  )

  return (
    <div>
      <div className="capitalize ">{`${type}`}:</div>
      <div className="my-5 flex flex-col ">
        {roles?.data &&
          roles.data.map((el, key) => {
            return (
              <div className="flex" key={key}>
                <div
                  className={`mx-5  ${moderators?.id === el.users.id && 'text-gray-500'}`}
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
                      {moderators?.id === el.users.id ? (
                        'Мoderator'
                      ) : !showRadio ? (
                        <button
                          onClick={() =>
                            type !== 'coordinators'
                              ? handleUpdate(el.users.id)
                              : setShowSelect(true)
                          }
                          className="btn-filled w-28 my-1"
                          disabled={showSelect || moderators?.id === el.users.id}
                        >
                          Удалить
                        </button>
                      ) : (
                        <div className="form-check">
                          <input
                            onChange={(e) => setModerator(e.target.value)}
                            disabled={moderators?.id === el.users.id}
                            className={`form-check-input appearance-none rounded-full h-4 w-4 border border-gray-300 bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 my-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 ${
                              moderators?.id !== el.users.id && 'cursor-pointer'
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
                  onChange={(event) => setUserId(event.target.value)}
                  className="form max-w-sm"
                >
                  {availableTranslators.map((el) => {
                    return (
                      <option key={el.id} value={el.id}>
                        {el.email}
                      </option>
                    )
                  })}
                </select>
                <button
                  onClick={() => {
                    if (roles?.data.length !== 0 && type === 'coordinators') {
                      handleUpdate(roles.data[0].users.id)
                      return
                    }
                    handleSet()
                  }}
                  className="inline-block ml-2 btn-filled w-28 my-1"
                >
                  {`Назначить ${
                    type !== 'coordinators' ? 'переводчика' : 'координатора'
                  }`}
                </button>
                <button
                  onClick={() => setShowSelect(false)}
                  className="inline-block mx-2 btn-filled w-28 my-1"
                >
                  Отменить
                </button>
              </div>
            )}

            <button
              onClick={() => setShowSelect(true)}
              className="btn-filled w-28 my-1"
              disabled={showSelect || showRadio}
            >
              {type !== 'coordinators'
                ? 'Добавить переводчика'
                : `${roles?.data.length > 0 ? 'Поменять' : 'Добавить'} координатора`}
            </button>

            {((permissions?.data &&
              permissions.data.map((el) => el.permission).includes('moderator.set')) ||
              role === 'admin') &&
              type === 'translators' && (
                <button
                  onClick={() => setShowRadio((prev) => !prev)}
                  className="btn-filled w-28 my-1"
                  disabled={showSelect || showRadio}
                >
                  Выбрать модератора
                </button>
              )}
            {showRadio && (
              <>
                <button
                  onClick={() => setShowRadio((prev) => !prev)}
                  className="btn-filled w-28 my-1"
                >
                  Отменить
                </button>
                <button
                  disabled={!moderator}
                  onClick={handleSetModerator}
                  className="btn-filled w-28 my-1"
                >
                  Назначить модератора
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ProjectRolesEdit
