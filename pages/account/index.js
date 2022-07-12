import { useRouter } from 'next/router'
import Account from '../../components/Account'
import { useUser } from '../../lib/UserContext'

function AccountPage() {
  const router = useRouter()
  const { user } = useUser()
  if (user) {
    router.push(`/account/${user?.id}`)
  }
  return <Account /> //TODO сделать, чтобы ничего не возвращалось, реально?
}

export default AccountPage
