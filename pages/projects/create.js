import { useState } from 'react'
import { useUser } from '../../lib/UserContext'
import { useAllUsers, useLanguages, useMethod } from '../../utils/hooks'

function CreateProjectPage() {
  const [language, setLanguage] = useState(null)
  const [title, setTitle] = useState('')
  const [coordinator, setCoordinator] = useState('')
  const [styleTitle, setStyleTitle] = useState('form')
  const [method, setMethod] = useState(null)
  const [code, setCode] = useState(null)

  const { user, session } = useUser()
  const [languages, { mutate }] = useLanguages(session?.access_token)
  const [methods] = useMethod(session?.access_token)
  const [users] = useAllUsers(session?.access_token)

  const createProject = async () => {
    if (!title || !language || !coordinator || code) {
      setStyleTitle('form-invalid')
      return
    }
    setStyleTitle('form')
    const { data, error } = await supabase
      .from('projects')
      .insert([{ title: title, language_id: language }])
    const { data: project_coordinator } = await supabase
      .from('project_coordinator')
      .insert([{ project_id: data.id, user_id: coordinator }])
  }

  return (
    <div>
      <div>Имя проекта</div>
      <input
        onBlur={(e) => setTitle(e.target.value)}
        className={`${styleTitle} max-w-sm`}
      />
      <div>Код проекта</div>
      <input
        onBlur={(e) => setCode(e.target.value)}
        className={`${styleTitle} max-w-sm`}
      />
      <div>Язык</div>
      <select onChange={(e) => setLanguage(e.target.value)} className="form max-w-sm">
        {languages &&
          languages.map((el) => {
            return <option key={el.id}>{el.orig_name}</option>
          })}
      </select>
      <div>Координатор проекта</div>
      <select onChange={(e) => setCoordinator(e.target.value)} className="form max-w-sm">
        {users &&
          users.data.map((el) => {
            return <option key={el.id}>{el.email}</option>
          })}
      </select>
      <div>Метод</div>
      <select onChange={(e) => setMethod(e.target.value)} className="form max-w-sm">
        {methods &&
          methods.data.map((el) => {
            return <option key={el.id}>{el.title}</option>
          })}
      </select>
      <button onClick={createProject} className="btn btn-cyan btn-filled">
        Создать проект
      </button>
    </div>
  )
}

export default CreateProjectPage
