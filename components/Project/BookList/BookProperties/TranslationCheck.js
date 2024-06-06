import React, { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'
import axios from 'axios'
import Modal from 'components/Modal'
import { useCurrentUser } from 'lib/UserContext'

function TranslationCheck({ project, book }) {
  const { t } = useTranslation()
  const { user, getUser } = useCurrentUser()
  const [isAuthComcheck, setIsAuthComcheck] = useState(false)

  useEffect(() => {
    if (user?.comcheck_token) {
      setIsAuthComcheck(true)
    }
  }, [user?.comcheck_token])
  return (
    <div className="flex flex-col py-7 px-10 border border-th-secondary-300 rounded-b-2xl bg-th-secondary-10">
      {isAuthComcheck ? (
        <Checks
          user={user}
          projectName={project?.title}
          bookName={t('books:' + book?.code)}
        />
      ) : (
        /**TODO
         * моргает при загрузке компонента, нужно другое решение
         */
        <Auth projectId={project.id} getUser={getUser} />
      )}
    </div>
  )
}

export default TranslationCheck

function Auth({ projectId, getUser }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    axios
      .post('/api/comcheck/save_token', {
        token: e.target[0].value,
        project_id: projectId,
      })
      .then(() => getUser())
  }
  return (
    <form onSubmit={handleSubmit}>
      <p>Вы не авторизованы, введите свой токен</p>
      <div className="flex gap-3">
        <input className="input-primary" />
        <button type="submit" className="btn-primary">
          Сохранить
        </button>
      </div>
    </form>
  )
}

function Checks({ user, projectName, bookName }) {
  const [isOpen, setIsOpen] = useState(false)
  useEffect(() => {
    const getProject = async () => {
      axios
        .get('/api/comcheck/get_projects')
        .then((res) => {
          console.log(res.data)
        })
        .catch((err) => {
          console.log(err)
        })
    }
    getProject()
  }, [user?.comcheck_token])

  const handleSubmit = (e) => {
    e.preventDefault()
  }
  return (
    <div>
      Проверки
      <br />
      <br />
      <div class="relative overflow-x-auto shadow-md sm:rounded-lg"></div>
      <br />
      <button className="btn-primary" onClick={() => setIsOpen(true)}>
        Создать проверку по этой книге
      </button>
      <Modal
        title="Создание проверки"
        isOpen={isOpen}
        closeHandle={() => setIsOpen(false)}
      >
        <form className="py-10" onSubmit={handleSubmit}>
          <div className="flex items-center gap-3">
            <div>Название:</div>
            <input className="input-primary" />
          </div>
          <br />

          <button type="submit" className="btn-primary">
            Создать
          </button>
        </form>
      </Modal>
    </div>
  )
}
