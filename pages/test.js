import { useResources } from '@/utils/hooks'
import axios from 'axios'
import { useCurrentUser } from 'lib/UserContext'
import { useEffect } from 'react'

function Test() {
  const { user } = useCurrentUser()
  useEffect(() => {
    const func = async () => {
      const result = await axios.get(
        'https://nextjs.org/docs/basic-features/data-fetching/get-server-side-props'
      )
      console.log({ result })
    }
    func()
  }, [])

  const data = useResources({
    code: 'ru_ust',
    owner: 'Door43-Catalog',
    commit: '5cb5b27c4213e7f632efdb4c070e03dea6408f11',
    book: '01-GEN.usfm',
    token: user?.access_token,
  })
  return <div>test</div>
}

export default Test
