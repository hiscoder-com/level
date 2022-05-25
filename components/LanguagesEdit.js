import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useLanguages } from '../utils/hooks'
import { useUser } from '../lib/UserContext'

export default function LanguagesEdit() {
  const { user, session } = useUser()
  const [loading, setLoading] = useState(false)
  const [eng, setEng] = useState('')
  const [code, setCode] = useState('')
  const [origName, setOrigName] = useState('')
  const [editLanguages, setEditLanguages] = useState(false)
  const [languages, { mutate }] = useLanguages(session?.access_token)
  const canEditLanguages = async () => {
    const { data, error } = await supabase.rpc('authorize', {
      requested_permission: 'languages',
      user_id: user.id,
    })
    setEditLanguages(data)
    return data
  }
  useEffect(() => {
    if (user) {
      canEditLanguages()
    }
    console.log({ editLanguages })
  }, [user])

  const handleSave = async () => {
    try {
      setLoading(true)
      const { user, error } = await supabase
        .from('languages')
        .insert([{ eng, code, orig_name: origName }])
      if (error) throw error
      mutate()
    } catch (error) {
      alert(error.error_description || error.message)
    } finally {
      setLoading(false)
    }
  }
  const handleDelete = async (id) => {
    const { error } = await supabase.from('languages').delete().match({ id })
    if (error) throw error
    mutate()
  }

  return (
    <div className="flex justify-center flex-col text-center text-3xl my-5">
      <h1 className="my-5">Languages:</h1>
      {languages?.map((el, index) => {
        return (
          <div key={index}>
            <p key={el.code}>
              {el.code + ' ' + el.orig_name}
              {editLanguages ? (
                <span
                  className="text-black inline-block ml-10 cursor-pointer bg-slate-400 rounded-lg p-1"
                  onClick={() => handleDelete(el.id)}
                >
                  Delete
                </span>
              ) : (
                ''
              )}
            </p>
          </div>
        )
      })}
      {editLanguages && (
        <>
          <div>
            <label>eng</label>
            <input
              className="border border-green-600 p-2"
              type="text"
              placeholder="Your eng"
              value={eng}
              onChange={(e) => setEng(e.target.value)}
            />
          </div>
          <div>
            <label>code</label>
            <input
              className="border border-green-600 p-2"
              type="text"
              placeholder="Your code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <div>
            <label>orig_name</label>
            <input
              className="border border-green-600 p-2"
              type="text"
              placeholder="Your orig_name"
              value={origName}
              onChange={(e) => setOrigName(e.target.value)}
            />
          </div>
          <div>
            <button
              disabled={loading}
              onClick={handleSave}
              className="text-3xl py-3 px-4 rounded-xl bg-green-300 border-green-500 border max-w-xs text-center my-2 disabled:text-gray-400"
            >
              Save
            </button>
          </div>
        </>
      )}
    </div>
  )
}
