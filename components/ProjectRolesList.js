import React, { useEffect, useState } from 'react'

function ProjectRolesEdit({
  users,
  type,
  role,
  roles,
  permissions,
  showSelectTranslator,
  setShowSelectTranslator,
}) {
  const availableTranslators = useMemo(
    () =>
      roles &&
      users &&
      Object.values(users).filter(
        (user) =>
          !roles.data
            .map((el) => {
              return el.users.id
            })
            .includes(user.id)
      ),
    [roles, users]
  )
  const [config, setConfig] = useState(null)
  useEffect(() => {
    switch (type) {
      case 'translator':
        setConfig({ title: 'Translators', permission: 'translator.set' })
        break

      default:
        break
    }
  }, [type])

  return (
    <div>
      {config && (
        <>
          {config.title}
          <div className="my-5 flex flex-col ">
            {roles?.data &&
              roles.data.map((el, key) => {
                return (
                  <div className="flex" key={key}>
                    <div className="mx-5">{el.users.email}</div>
                    {((permissions?.data &&
                      permissions.data
                        .map((el) => el.permission)
                        .includes(config.permission)) ||
                      role === 'admin') && (
                      <button
                        onClick={() => handleDeleteTranslator(el.users.id)}
                        className="btn-filled w-28 my-1"
                        disabled={showSelectTranslator}
                      >
                        Удалить
                      </button>
                    )}
                  </div>
                )
              })}

            {((permissions?.data &&
              permissions.data.map((el) => el.permission).includes(config.permission)) ||
              role === 'admin') && (
              <>
                {showSelectTranslator && (
                  <div className="inline-block">
                    <select
                      onChange={(event) => setTranslatorId(event.target.value)}
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
                      onClick={handleSetTranslator}
                      className="inline-block ml-2 btn-filled w-28 my-1"
                    >
                      Назначить
                    </button>
                    <button
                      onClick={() => setShowSelectTranslator(false)}
                      className="inline-block mx-2 btn-filled w-28 my-1"
                    >
                      Отменить
                    </button>
                  </div>
                )}
                <button
                  onClick={() => setShowSelectTranslator(true)}
                  className="btn-filled w-28 my-1"
                  disabled={showSelectTranslator}
                >
                  Добавить
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default ProjectRolesEdit
