import { useState } from 'react'
import { supabase } from '../utils/supabaseClient'

export default function SignUp() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    try {
      setLoading(true)
      const { user, session, error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error
      alert('Check your email to confirm registration.')
    } catch (error) {
      alert(error.error_description || error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center flex-col text-center text-3xl my-5">
      <h1 className="my-5">Sign up</h1>

      <div>
        <label>Email</label>
        <input
          className="border border-green-600 p-2"
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label>Password</label>
        <input
          className="border border-green-600 p-2"
          type="password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <button
          disabled={loading}
          onClick={handleLogin}
          className="text-3xl py-3 px-4 rounded-xl bg-green-300 border-green-500 border max-w-xs text-center my-2 disabled:text-gray-400"
        >
          Register
        </button>
      </div>
    </div>
  )
}
