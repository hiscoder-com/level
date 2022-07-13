import { useRouter } from 'next/router'
import Account from '../../components/Account'
import { useUser } from '../../lib/UserContext'

function AccountHomePage() {
  const router = useRouter()

  const { user } = useUser()
  if (user) {
    router.push(`/account/${user?.id}`)
  }
  return <Account />
}

export default AccountHomePage
