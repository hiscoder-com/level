import { useState } from 'react'
import { useUser } from '../../lib/UserContext'
import { useAllUsers, useLanguages, useMethod, useProjectType } from '../../utils/hooks'
import { supabase } from '../../utils/supabaseClient'

function CreateProjectPage() {
  const [language, setLanguage] = useState(null)
  const [title, setTitle] = useState('')

  const [styleTitle, setStyleTitle] = useState('form')
  const [method, setMethod] = useState(null)
  const [type, setType] = useState(null)
  const [code, setCode] = useState(null)

  const { user, session } = useUser()
  const [languages, { mutate }] = useLanguages(session?.access_token)
  const [methods] = useMethod(session?.access_token)
  const [users] = useAllUsers(session?.access_token)
  const projectTypes = ['obs', 'bible']

  const createProject = async () => {
    if (!title || !language || !code || !method || !type) {
      setStyleTitle('form-invalid')
      return
    }
    setStyleTitle('form')
    console.log({ title, language, code, method, type })
    const { data, error } = await supabase
      .from('projects')
      .insert([{ title, language_id: language, type, method_id: method, code }])
    console.log({ data, error })
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
            return (
              <option key={el.id} value={el.id}>
                {el.orig_name}
              </option>
            )
          })}
      </select>

      <div>Метод</div>
      <select
        onChange={(e) => {
          setMethod(e.target.value)
        }}
        className="form max-w-sm"
      >
        {methods &&
          methods.data.map((el) => {
            return (
              <option key={el.id} value={el.id}>
                {el.title}
              </option>
            )
          })}
      </select>
      <select onChange={(e) => setType(e.target.value)} className="form max-w-sm">
        {projectTypes &&
          projectTypes.map((el) => {
            return (
              <option key={el} value={el}>
                {el}
              </option>
            )
          })}
      </select>
      <button onClick={createProject} className="btn btn-cyan btn-filled">
        Создать проект
      </button>
    </div>
  )
}

export default CreateProjectPage
