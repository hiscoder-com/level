import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabaseClient'

export default function LanguagesEdit() {
  const [loading, setLoading] = useState(false)
  const [eng, setEng] = useState('')
  const [code, setCode] = useState('')
  const [origName, setOrigName] = useState('')
  const [listLanguages, setListLanguages] = useState()

  const handleSave = async () => {
    try {
      setLoading(true)
      const { user, error } = await supabase
        .from('languages')
        .insert([{ eng, code, orig_name: origName }])
      if (error) throw error
      alert('Check your email for the login link!')
    } catch (error) {
      alert(error.error_description || error.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    const main = async () => {
      const { data: languages, error } = await supabase.from('languages').select('*')
      setListLanguages(languages)
    }
    main()
  }, [])

  return (
    <div className="flex justify-center flex-col text-center text-3xl my-5">
      <h1 className="my-5">Sign in</h1>
      {listLanguages?.map((el) => {
        return <p key={el.code}>{el.code + ' ' + el.orig_name}</p>
      })}
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
    </div>
  )
}
