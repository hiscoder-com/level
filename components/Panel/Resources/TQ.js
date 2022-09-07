import { useGetResource } from 'utils/hooks'

import TQView from '../UI/ToolView'

function TQ({ config }) {
  const { loading, data, error } = useGetResource({ config, url: '/api/git/tq' })

  return <>{loading ? 'Loading...' : <TQView data={data} />}</>
}

export default TQ
