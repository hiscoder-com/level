import { useGetResource } from 'utils/hooks'
import { Placeholder, TQView } from '../UI'

function TQ({ config }) {
  const { loading, data, error } = useGetResource({ config, url: '/api/git/tq' })

  return <>{loading ? <Placeholder /> : <TQView data={data} />}</>
}

export default TQ
