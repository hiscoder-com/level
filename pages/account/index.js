import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useUser } from '../../lib/UserContext'

function AccountHomePage() {
  const router = useRouter()

  const { user } = useUser()
  useEffect(() => {
    if (user) {
      router.push(`/account/${user?.id}`)
    }
  }, [router, user])
}

export default AccountHomePage
