import { useEffect, useState, createContext, useContext } from 'react'

const UserContext = createContext({ user: null, session: false, loading: true })

export const UserContextProvider = (props) => {
  const { supabaseClient } = props
  const [session, setSession] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      const { data: session } = await supabaseClient.auth.getSession()
      setSession(session)
    }
    getSession()
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const getUser = async (id) => {
      try {
        setLoading(true)
        const { data: user, error } = await supabaseClient
          .from('users')
          .select('id, login, email, blocked, agreement, confession, is_admin')
          .eq('id', id)
          .single()
        if (error) throw error
        user.access_token = session.access_token
        setUser(user)
      } catch (error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    if (session === false) return
    if (session?.user?.id) {
      getUser(session.user.id)
    } else {
      setUser(null)
      setLoading(false)
    }
  }, [session, supabaseClient])

  const value = {
    session,
    user,
    loading,
  }
  return <UserContext.Provider value={value} {...props} />
}

export const useCurrentUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error(`useCurrentUser must be used within a UserContextProvider.`)
  }
  return context
}
