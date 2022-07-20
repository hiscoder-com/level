import { useState } from 'react'

import { useRouter } from 'next/router'

import { supabase } from '@/utils/supabaseClient'

export default function SignOut() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      alert(error.error_description || error.message)
    } finally {
      setLoading(false)
      router.push('/')
    }
  }

  return (
    <div className="flex justify-center flex-col  text-xl my-5">
      <div>
        <button
          disabled={loading}
          onClick={handleLogout}
          className="text-xl py-3 px-4 rounded-xl bg-green-300 border-green-500 border max-w-xs text-center my-2 disabled:text-gray-400"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
